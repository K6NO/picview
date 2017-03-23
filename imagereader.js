const fs = require('fs');
const sizeOf = require('image-size');
const moment = require('moment');
const albumsRootFolder = './img/albums';


//TODO refactor Picture and Album into classes
function Picture(src, link, alt, dataLightbox, height, width){
    this.src = src;
    this.link = link;
    this.alt = alt;
    this.height = height;
    this.width = width;
    this.dataLightbox = dataLightbox;
}

function Album(title, date) {
    //TODO implement functions to get and set cover picture (prototype or by transforming this to classes?)
    //TODO when above is done remove pictures so that it doesnt have to be called each time when only album view is loaded
    this.albumName = title;
    this.albumDate = date;
    this.albumLink = `?album=${title}`;
    this.pictures = getAlbumThumbnails(this.albumName);
    this.albumCover = getAlbumCover(this.albumName);
    this.albumDLmedium = `/albums/${title}/medium/${title}_medium.zip`;
    this.albumDLfull = `/albums/${title}/full/${title}_full.zip`;

    function getAlbumCover(albumName) {
        let pictures = getAlbumThumbnails(albumName);
        let cover = pictures[Math.floor(Math.random() * pictures.length)].src;
        let dimension = sizeOf(cover);
        while (dimension.width < dimension.height) {
            cover = pictures[Math.floor(Math.random() * pictures.length)].src;
            dimension = sizeOf(cover);
        }
        return cover;
    }

    function getAlbumThumbnails (albumName) {
        return readThumbnails(albumName);
    }
} // end of album

function getSingleAlbum(albumName){
    let album = new Album(albumName);
    return album;
}

function readAlbums(albumDate){

    let albums = fs.readdirSync(albumsRootFolder);
    let albumsList = [];
    for (let key in albums){
        if(albums[key].indexOf('.') === -1) {
            let albumName = albums[key];
            if (albumDate === 'undefined') albumDate = moment().format('YYYY');
            //let albumImages = readThumbnails(albumName);

            let album = new Album(albumName, albumDate);

            albumsList.push(album);
        }
    }
    return albumsList;
}

// display thumbnails -> uses Picture to generate an object with values (href, src, dataLightbox, dimensions)
function readThumbnails (albumName) {
    let sourceFolder = `./img/albums/${albumName}/thumb`;
    let listOfThumbnails = [];
    let thumbs = fs.readdirSync(sourceFolder);
    for (let key in thumbs) {
        if (thumbs[key].toLowerCase().indexOf('.jpg') !== -1) {
            let thumbsDimensions = sizeOf(`${sourceFolder}/${thumbs[key]}`);
            let src = `${sourceFolder}/${thumbs[key]}`;
            let link = `./img/albums/${albumName}/medium/med_${thumbs[key].slice(3)}`;
            let alt = thumbs[key].slice(0, -4);
            let dataLightbox = albumName;
            let thumbnail = new Picture(src, link, alt, dataLightbox, thumbsDimensions.height, thumbsDimensions.width);
            listOfThumbnails.push(thumbnail);
        }
    } // end for in loop
    return listOfThumbnails;
}

//not used currently
function readImages (imgFolder) {
    var colombiaAlbum = [];
    fs.readdir(imgFolder, function (error, images) {
        if (!error) {
            for (let key in images) {
                if (images[key].toLowerCase().indexOf('.jpg') !== -1) {

                    let fullDimensions = sizeOf(imgFolder + images[key]);
                    let image = new Picture(imgFolder + images[key], images[key].slice(0, -4), fullDimensions.height, fullDimensions.width);
                    colombiaAlbum.push(image);
                }
            } // end for in loop

        } else {
            console.error("Readdir error: " + error)
        }
    });
    return colombiaAlbum;
}

module.exports.readImages = readImages;
module.exports.readThumbnails = readThumbnails;
module.exports.readAlbums = readAlbums;
module.exports.getSingleAlbum = getSingleAlbum;
