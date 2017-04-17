const sharp = require('sharp'); // Sharp resize documentation: http://sharp.dimens.io/en/stable/api-resize/
const fs = require('fs');
const sizeOf = require('image-size');
const dir = 'img/upload/';
var appRootDir = require('app-root-dir').get();
var albumsFolder = appRootDir + '/public/img/albums/';

/**
 * Counts the number of folders in album library, returns id for next album
 * @returns {number}
 */
function getAlbumCounter(){
    let albums = fs.readdirSync(albumsFolder);
    let counter = 0;
    for(let i= 0; i<albums.length; i++){
        if(albums[i].indexOf('.') === -1) {
            counter += 1;
        }
    }
    return counter + 1;
}
/**
 * Converts images from upload folder into thumbs and medium-sized images, saves everything to albums/[album]/. Renames
 * (moves) original image to albums/[album]/large
 * @param sourceFolder
 * @param targetSizes (thumb, medium)
 * @param album
 */
function resizeImages(sourceFolder, targetSizes, album) {
    console.log('called resizer');
    console.log(sourceFolder);

    fs.readdir(sourceFolder, function (error, images) {
        if (!error) {
            // count the number of albums, get new id (for folder naming)
            let albumCounter = getAlbumCounter();
            fs.mkdirSync(`${albumsFolder}${albumCounter}_${album}`);
            fs.mkdirSync(`${albumsFolder}${albumCounter}_${album}/large`);
            fs.mkdirSync(`${albumsFolder}${albumCounter}_${album}/medium`);
            fs.mkdirSync(`${albumsFolder}${albumCounter}_${album}/thumb`);
            fs.mkdirSync(`${albumsFolder}${albumCounter}_${album}/zip`);


            for (let key in images) {
                //selecting .jpg images, getting dimensions
                if (images[key].toLowerCase().indexOf('.jpg') !== -1) {
                    var dimensions = sizeOf(sourceFolder + images[key]);
                    var divider;

                    // resizing
                    // thumbs vertical
                    if (dimensions.width < dimensions.height) {
                        sharp(sourceFolder + images[key])
                            .resize(180, 240)
                            .toFile(`${albumsFolder}${albumCounter}_${album}/thumb/th_${images[key]}`, (err, info) =>
                                (err) => console.log(err));
                    }
                    // thumbs horizontal
                    else {
                        sharp(sourceFolder + images[key])
                            .resize(240, 180)
                            .toFile(`${albumsFolder}${albumCounter}_${album}/thumb/th_${images[key]}`, (err, info) =>
                                (err) => console.log(err));
                    }
                    // medium images
                    if (dimensions.width > 2000 || dimensions.height > 2000) divider = 4;
                    else divider = 2;

                    sharp(sourceFolder + images[key])
                        .resize(Math.floor(dimensions.width / divider), Math.floor(dimensions.height / divider))
                        .toFile(`${albumsFolder}${albumCounter}_${album}/medium/med_${images[key]}`, (err, info) =>
                            (err) => console.log(err));

                    //large images
                    sharp(sourceFolder + images[key])
                        .resize(dimensions.width, dimensions.height)
                        .toFile(`${albumsFolder}${albumCounter}_${album}/large/${images[key]}`, (err, info) =>
                            (err) => console.log(err));
                }

            } // end for-in
        } else {
            console.error("Error when attempting to read image source folder: " + error);
        }
    }); // end readdir
}

module.exports.resizeImages = resizeImages;