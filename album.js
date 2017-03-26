const fs = require('fs');
const sizeOf = require('image-size');

let Picture = require('./picture.js');

class Album {

    // display getThumbnails -> uses Picture to generate an object with values (href, src, dataLightbox, dimensions)

    //get pictures () {
    //    return this.getThumbnails(this.albumName);
    //}


    getThumbnails () {
        let sourceFolder = `./img/albums/${this.albumName}/thumb`;
        let listOfThumbnails = [];
        let thumbs = fs.readdirSync(sourceFolder);
        for (let key in thumbs) {
            if (thumbs[key].toLowerCase().indexOf('.jpg') !== -1) {
                let thumbsDimensions = sizeOf(`${sourceFolder}/${thumbs[key]}`);
                let src = `${sourceFolder}/${thumbs[key]}`;
                let link = `./img/albums/${this.albumName}/medium/med_${thumbs[key].slice(3)}`;
                let alt = thumbs[key].slice(0, -4);
                let dataLightbox = this.albumName;
                let thumbnail = new Picture(src, link,alt, dataLightbox, thumbsDimensions.height, thumbsDimensions.width);
                listOfThumbnails.push(thumbnail);
            }
        } // end for in loop
        return listOfThumbnails;
    };

    getAlbumCover () {
        let pictures = this.getThumbnails(this.albumName);

        let cover = pictures[Math.floor(Math.random() * pictures.length)].src;
        let dimension = sizeOf(cover);
        while (dimension.width < dimension.height) {
            cover = pictures[Math.floor(Math.random() * pictures.length)].src;
            dimension = sizeOf(cover);
        }
        return cover;
    }

    constructor({albumName, albumDate = 2017} = { }) {
        this.albumName = albumName;
        this.albumDate = albumDate;
        this.pictures = this.getThumbnails();
        this.albumCover = this.getAlbumCover();
        this.albumLink = `?album=${albumName}`;
        this.albumDLmedium = `/albums/${albumName}/medium/${albumName}_medium.zip`;
        this.albumDLfull = `/albums/${albumName}/full/${albumName}_full.zip`;
    }
} // end of album
module.exports = Album;