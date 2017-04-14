const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

let Picture = require('./picture.js');

class Album {

    // display getThumbnails -> uses Picture to generate an object with values (href, src, dataLightbox, dimensions)

    //get pictures () {
    //    return this.getThumbnails(this.albumName);
    //}


    getThumbnails () {
        //let sourceFolder = `${__dirname}/../public/img/albums/${this.albumName}/thumb`;
        let sourceFolder = path.join(__dirname, '..', 'public/img/albums', this.albumName);

        let listOfThumbnails = [];
        let thumbs = fs.readdirSync(path.join(sourceFolder, 'thumb'));
        console.log(thumbs);
        for (let key in thumbs) {
            if (thumbs[key].toLowerCase().indexOf('.jpg') !== -1) {
                let thumbsDimensions = sizeOf(path.join(sourceFolder, 'thumb', thumbs[key]));
                let src = path.join('img', 'albums', this.albumName, 'thumb', thumbs[key]); //`../public/img/albums/${this.albumName}/thumb/${thumbs[key]}`;
                let link = path.join('img', 'albums', this.albumName, 'medium', 'med_', thumbs[key].slice(3)); //`../public/img/albums/${this.albumName}/medium/med_${thumbs[key].slice(3)}`;
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
        console.log(this.albumName);

        console.log(pictures);
        let sourceFolder = path.join(__dirname, '..', 'public/');

        let cover = pictures[Math.floor(Math.random() * pictures.length)].src;
        let dimension = sizeOf(sourceFolder + cover);
        while (dimension.width < dimension.height) {
            cover = pictures[Math.floor(Math.random() * pictures.length)].src;
            dimension = sizeOf(sourceFolder + cover);
        }
        return cover;
    }

    constructor({albumName, albumDate = 2017} = { }) {
        this.albumName = albumName;
        this.albumDate = albumDate;
        this.pictures = this.getThumbnails();
        this.albumCover = this.getAlbumCover();
        this.albumLink = `/albums/${albumName}`;
        this.albumDLmedium = `/img/albums/${albumName}/medium/zip/${albumName}_medium.zip`;
        this.albumDLfull = `/img//albums/${albumName}/full/zip/${albumName}_full.zip`;
    }
} // end of album
module.exports = Album;