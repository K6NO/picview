const fs = require('fs');
const appRootDir = require('app-root-dir').get();

const S3FS = require('s3fs');
const bucketPath = process.env.S3_BUCKET_NAME || 'kepkukkanto';
const access_key = process.env.AWS_ACCESS_KEY_ID || require('../secret.json').access_key;
const secret = process.env.AWS_SECRET_ACCESS_KEY || require('../secret.json').secret;
let s3Options = {
    region: 'eu-central-1',
    accessKeyId : access_key,
    secretAccessKey : secret
};
let fsImpl = new S3FS(bucketPath, s3Options);

const uploadFolder = appRootDir + '/public/img/upload/';
const albumsFolder = '/public/img/albums/';
const sizeOf = require('image-size');
const sharp = require('sharp'); // Sharp resize documentation: http://sharp.dimens.io/en/stable/api-resize/
const archiver = require('archiver');

// HELPER FUNCTION
function filterExtensions (images) {
    return images.filter(function(image){
        return image.toLowerCase().indexOf('.jpg') !== -1 ||
            image.toLowerCase().indexOf('.png') !== -1 ||
            image.toLowerCase().indexOf('.jpeg') !== -1 ||
            image.toLowerCase().indexOf('.gif') !== -1;
    });
}

// FILE OPERATIONS

function checkUploadFolder (album) {
    return new Promise(function (resolve, reject) {
        fs.readdir(uploadFolder, (err, files) => {
            if(err) reject(err);
            if(files.length !== 0){
                resolve(album);
            } else {
                let emptyFolderError = new Error('The upload folder is empty.');
                reject(emptyFolderError)
            }
        })
    });
}

function countAlbums (album) {
    return new Promise(function (resolve, reject) {
        fsImpl.readdir(albumsFolder, (err, files) => {
            if(err) reject(err);
            let albumCount = 0;
            for(let entry in files){
                if(files[entry].indexOf('.') === -1){
                    albumCount ++;
                }
            }
            resolve([albumCount + 1, album]);
        })
    });
}

function createAlbumFolders(albumCount, album) {
    return new Promise(function(resolve, reject){
        fsImpl.mkdir(`${albumsFolder}${albumCount}_${album}`, (err) => {
            if(err) reject(err);
            fsImpl.mkdir(`${albumsFolder}${albumCount}_${album}/large`, (err) => {if(err) reject(err)});
            fsImpl.mkdir(`${albumsFolder}${albumCount}_${album}/medium`, (err) => {if(err) reject(err)});
            fsImpl.mkdir(`${albumsFolder}${albumCount}_${album}/thumb`, (err) => {if(err) reject(err)});
            fsImpl.mkdir(`${albumsFolder}${albumCount}_${album}/zip`, (err) => {if(err) reject(err)});
            resolve([albumCount, album]);
        });
    });
}

function readUploadFolder(albumCount, album){

    return new Promise(function(resolve, reject) {
        fs.readdir(uploadFolder, function (error, images) {
            if (!error) {

                // filter out unsupported file types
                let filteredImages = filterExtensions(images);
                resolve([filteredImages, albumCount, album]);
            } else {
                reject(new Error("Error when reading image upload folder on Heroku: " + error));
            }
        }); // end readdir
    })
}

function resizeImages(images, albumCount, album){
    return new Promise(function (resolve, reject) {

        // check if images is truthy (supported file types)
        if(images){
            for(let image in images) {
                var dimensions = sizeOf(uploadFolder + images[image]);
                var divider;
                let thumbFile = fsImpl.createWriteStream(`${albumsFolder}${albumCount}_${album}/thumb/th_${images[image]}`);
                let medFile = fsImpl.createWriteStream(`${albumsFolder}${albumCount}_${album}/medium/med_${images[image]}`);
                let largeFile = fsImpl.createWriteStream(`${albumsFolder}${albumCount}_${album}/large/${images[image]}`);

                // resizing
                // thumbs vertical
                if (dimensions.width < dimensions.height) {
                    sharp(uploadFolder + images[image])
                        .resize(180, 240)
                        .toBuffer((err, data, info) => {
                            if (err) reject(err);
                            return data;
                        })
                        .pipe(thumbFile);
                }
                // thumbs horizontal
                else {
                    sharp(uploadFolder + images[image])
                        .resize(240, 180)
                        .toBuffer((err, data, info) => {
                            if (err) reject(err);
                            return data;
                        })
                        .pipe(thumbFile);
                }
                // medium images
                if (dimensions.width > 2000 || dimensions.height > 2000) divider = 4;
                else divider = 2;

                sharp(uploadFolder + images[image])
                    .resize(Math.floor(dimensions.width / divider), Math.floor(dimensions.height / divider))
                    .toBuffer((err, data, info) => {
                        if (err) reject(err);
                        return data;
                    })
                    .pipe(medFile);

                // large images
                sharp(uploadFolder + images[image])
                    .resize(dimensions.width, dimensions.height)
                    .toBuffer((err, data, info) => {
                        if (err) reject(err);
                        return data;
                    })
                    .pipe(largeFile);
            }
            resolve([images, albumCount, album]);
        } else {
            reject(new Error('Unsupported file format.'))

        }
    });
}

function zipImages(images, albumCount, album) {

    return new Promise(function (resolve, reject) {
        var output = fsImpl.createWriteStream('/public/img/albums/' +
            albumCount + '_' +
            album + '/zip/' +
            albumCount + '_' + album + '_full.zip'
        );
        let archive = archiver('zip', {
            zlib: {level: 9}
        });

        // listen for all archive data to be written
        output.on('close', function() {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
        });

        // good practice to catch warnings (ie stat failures and other non-blocking errors)
        archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
                reject(new Error ('no such file or directory' + err));

            } else {
                // throw error
                reject(err);
            }
        });

        // good practice to catch this error explicitly
        archive.on('error', function(err) {
            reject(err);
        });

        for (let image in images) {
            let file = uploadFolder + images[image];
            archive.append(fs.createReadStream(file), {
                name : images[image]
            });
        }
        archive.pipe(output);

        archive.finalize();
        resolve();
    });

}

function deleteImagesFromUpload () {
    return new Promise (function (resolve, reject) {
        fs.readdir(appRootDir + '/public/img/upload/', (err, files) => {

            if(!err) {
                for (let key in files){
                    fs.unlink(appRootDir + '/public/img/upload/' + files[key], (err) => {
                        if (err) return new Error('Error when attempting to delete upload folder.')
                    })
                }
                resolve();
            } else {
                reject (new Error('Error when attempting to read upload folder.'));
            }
        });
    });
}


function resizeZipDelete (album){
    return checkUploadFolder(album)
        .then((album)=> { return countAlbums(album)})
        .then( ([albumCount, album]) => { return createAlbumFolders(albumCount, album)})
        .then( ([albumCount, album]) => {  return readUploadFolder(albumCount, album) })
        .then( ([images, albumCount, album]) => { return resizeImages(images, albumCount, album) } )
        .then( ([images, albumCount, album]) => { return zipImages(images, albumCount, album)} )
        .then( () => { return deleteImagesFromUpload()})
        .catch( (err) => {console.error(err)} );
}


module.exports.resizeZipDelete = resizeZipDelete;


