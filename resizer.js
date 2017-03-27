const sharp = require('sharp'); // Sharp resize documentation: http://sharp.dimens.io/en/stable/api-resize/
const fs = require('fs');
const sizeOf = require('image-size');

const dir = 'img/upload/';
const albumName = 'maszotura';

function getAlbumCounter(){
    let albums = fs.readdirSync('img/albums');
    let counter = 0;
    for(let i= 0; i<albums.length; i++){
        if(albums[i].indexOf('.') === -1) {
            counter += 1;
        }
    }
    return counter + 1;
}
/**
 *
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
            console.log(albumCounter);
            fs.mkdirSync(`./img/albums/${albumCounter}_${album}`);
            fs.mkdirSync(`./img/albums/${albumCounter}_${album}/large`);
            fs.mkdirSync(`./img/albums/${albumCounter}_${album}/medium`);
            fs.mkdirSync(`./img/albums/${albumCounter}_${album}/thumb`);


            for (let key in images) {
                //selecting .jpg images, getting dimensions
                if (images[key].toLowerCase().indexOf('.jpg') !== -1) {
                    var dimensions = sizeOf(sourceFolder + images[key]);
                    var divider;

                    // performing the resizing on all target sizes
                    for (let targetSize in targetSizes) {
                        //resizing images to thumbnail size
                        console.log(targetSizes[targetSize]);
                        if (targetSizes[targetSize] === 'thumb') {
                            // resizing vertical images
                            if (dimensions.width < dimensions.height) {
                                sharp(sourceFolder + images[key])
                                    .resize(180, 240)
                                    .toFile(`img/albums/${albumCounter}_${album}/${targetSizes[targetSize]}/th_${images[key]}`, (err, info) =>
                                        (err) => console.log(err)
                                    );
                                console.log('Vertical iPhone images ' + images[key]);
                            }
                            // resizing horizontal pictures
                            else {
                                sharp(sourceFolder + images[key])
                                    .resize(240, 180)
                                    .toFile(`img/albums/${albumCounter}_${album}/${targetSizes[targetSize]}/th_${images[key]}`, (err, info) =>
                                        (err) => console.log(err)
                                    );
                                console.log('Horizontal iPhone images ' + images[key]);
                            }
                        }

                        // resizing images to medium size
                        if (targetSizes[targetSize] === 'medium') {
                            // resizing factor dependent upon original dimensions (very large images are downsized by
                            // a factor of 4, other images by a factor of 2
                            if (dimensions.width > 2000 || dimensions.height > 2000) divider = 4;
                            else divider = 2;

                            //resizing vertical images (no need to separate vertical/horizontal

                            sharp(sourceFolder + images[key])
                                .resize(Math.floor(dimensions.width / divider), Math.floor(dimensions.height / divider))
                                .toFile(`img/albums/${albumCounter}_${album}/${targetSizes[targetSize]}/med_${images[key]}`, (err, info) =>
                                    (err) => console.log(err)
                                );
                            console.log('Vertical medium images ' + images[key]);
                        }
                    }
                }

            } // end for-in
        } else {
            console.error("Error when attempting to read image source folder: " + error);
        }
    }); // end readdir
}

module.exports.resizeImages = resizeImages;