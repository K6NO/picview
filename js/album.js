const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const sizeOf = require('image-size');

let Picture = require('./picture.js');

class Album {

    getThumbnails () {
        let sourceFolder = path.join(__dirname, '..', 'public/img/albums', this.albumName);
        let listOfThumbnails = [];
        return fs.readdirAsync(path.join(sourceFolder, 'thumb'))
            .then((thumbs)=> {
                for (let key in thumbs) {
                    if (thumbs[key].toLowerCase().indexOf('.jpg') !== -1) {
                        let thumbsDimensions = sizeOf(path.join(sourceFolder, 'thumb', thumbs[key]));
                        let src = path.join('/img', 'albums', this.albumName, 'thumb', thumbs[key]); //`../public/img/albums/${this.albumName}/thumb/${thumbs[key]}`;
                        let link = path.join('/img', 'albums', this.albumName, 'medium', 'med_' + thumbs[key].slice(3)); //`../public/img/albums/${this.albumName}/medium/med_${thumbs[key].slice(3)}`;
                        let alt = thumbs[key].slice(0, -4);
                        let albumName = this.albumName;
                        let thumbnail = new Picture(src, link,alt, albumName, thumbsDimensions.height, thumbsDimensions.width);
                        listOfThumbnails.push(thumbnail);
                    }
                } // end for in loop
                return listOfThumbnails;
            });
    };

    getAlbumCover () {
        return this.getThumbnails()
            .then((pictures)=> {
                let sourceFolder = path.join(__dirname, '..', 'public/');
                let cover = pictures[Math.floor(Math.random() * pictures.length)].src;
                let dimension = sizeOf(sourceFolder + cover);
                while (dimension.width < dimension.height) {
                    cover = pictures[Math.floor(Math.random() * pictures.length)].src;
                    dimension = sizeOf(sourceFolder + cover);
                }
                console.log(cover);
                return cover;
            })
            .then((cover)=> {
                return cover;
            });
    }

    constructor({albumName, albumDate = 2017} = { }) {
        this.albumName = albumName;
        this.albumDate = albumDate;
        this.albumCover = "";
        this.albumLink = `albums/${albumName}`;
        this.albumDLmedium = `/download/${albumName}/medium`;
        this.albumDLfull = `/download/${albumName}/full`;
    }
} // end of album
module.exports = Album;