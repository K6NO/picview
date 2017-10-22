const fs = require('fs');
const appRootDir = require('app-root-dir').get();

const S3FS = require('s3fs');
const bucketPath = 'http://s3.amazonaws.com/kepkukkanto/';
let s3Options = {
    region: 'eu-central-1'
};
let fsImpl = new S3FS(bucketPath, s3Options);

const uploadFolder = appRootDir + '/public/img/upload/';
const albumsFolder = appRootDir + '/public/img/albums/';
const sizeOf = require('image-size');
const sharp = require('sharp'); // Sharp resize documentation: http://sharp.dimens.io/en/stable/api-resize/
const archiver = require('archiver');

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
        fs.readdir(albumsFolder, (err, files) => {
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
        fs.mkdir(`${albumsFolder}${albumCount}_${album}`, (err) => {
            if(err) reject(err);
            fs.mkdir(`${albumsFolder}${albumCount}_${album}/large`, (err) => {if(err) reject(err)});
            fs.mkdir(`${albumsFolder}${albumCount}_${album}/medium`, (err) => {if(err) reject(err)});
            fs.mkdir(`${albumsFolder}${albumCount}_${album}/thumb`, (err) => {if(err) reject(err)});
            fs.mkdir(`${albumsFolder}${albumCount}_${album}/zip`, (err) => {if(err) reject(err)});
            resolve([albumCount, album]);
        });
    });
}

function readUploadFolder(albumCount, album){
    console.log('readupload: ' + album);

    return new Promise(function(resolve, reject) {
        fs.readdir(uploadFolder, function (error, images) {
            if (!error) {
                resolve([images, albumCount, album]);
            } else {
                reject(new Error("Error when attempting to read image source folder: " + error));
            }
        }); // end readdir
    })
}

function resizeImages(images, albumCount, album){
    return new Promise(function (resolve, reject) {
        let sourceFolder = appRootDir + '/public/img/upload/';
        console.log('resizing: ' + album);

        for(let image in images) {
            if (images[image].toLowerCase().indexOf('.jpg') !== -1 ||
                images[image].toLowerCase().indexOf('.png') !== -1 ||
                images[image].toLowerCase().indexOf('.jpeg') !== -1 ||
                images[image].toLowerCase().indexOf('.gif') !== -1 ) {

                var dimensions = sizeOf(sourceFolder + images[image]);
                var divider;

                // resizing
                // thumbs vertical
                if (dimensions.width < dimensions.height) {
                    sharp(sourceFolder + images[image])
                        .resize(180, 240)
                        .toFile(`${albumsFolder}${albumCount}_${album}/thumb/th_${images[image]}`, (err, info) =>
                             (err) => reject(err));
                }
                // thumbs horizontal
                else {
                    sharp(sourceFolder + images[image])
                        .resize(240, 180)
                        .toFile(`${albumsFolder}${albumCount}_${album}/thumb/th_${images[image]}`, (err, info) =>
                            (err) => reject(err));
                }
                // medium images
                if (dimensions.width > 2000 || dimensions.height > 2000) divider = 4;
                else divider = 2;

                sharp(sourceFolder + images[image])
                    .resize(Math.floor(dimensions.width / divider), Math.floor(dimensions.height / divider))
                    .toFile(`${albumsFolder}${albumCount}_${album}/medium/med_${images[image]}`, (err, info) =>
                        (err) => reject(err));

                // large images
                sharp(sourceFolder + images[image])
                    .resize(dimensions.width, dimensions.height)
                    .toFile(`${albumsFolder}${albumCount}_${album}/large/${images[image]}`, (err, info) =>
                        (err) => reject(err));

            } else {
                reject(new Error('Unsupported file format.'))
            }
        }
        resolve([images, albumCount, album]);



    });
}

function zipImages(images, albumCount, album) {
    console.log('zipping: ' + album);


    return new Promise(function (resolve, reject) {
        var output = fs.createWriteStream(appRootDir +
            '/public/img/albums/' +
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

        console.log('zipper');


        let uploadFolder = appRootDir + '/public/img/upload/';

        console.log('Images when zipping upload folder: ' + images.length);
        for (let image in images) {
            let file = uploadFolder + images[image];
            console.log(file);
            archive.append(fs.createReadStream(file), {
                name : images[image]
            });
        }
        archive.pipe(output);

        archive.finalize();
        console.log('zipper2');
        resolve();
    });

}

function deleteImagesFromUpload () {
    console.log('delete');
    return new Promise (function (resolve, reject) {
        console.log('delete2');
        console.log(appRootDir + '/public/img/upload/');
        fs.readdir(appRootDir + '/public/img/upload/', (err, files) => {
            console.log('delete2');
            console.log(files);

            if(!err) {
                for (let key in files){
                    console.log(files[key]);
                    fs.unlink(appRootDir + '/public/img/upload/' + files[key], (err) => {
                        console.log('delete3');

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
    console.log(album);
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



