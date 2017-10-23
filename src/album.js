const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const sizeOf = require('image-size');

let Picture = require('./picture.js');
let albumsFolder = 'public/img/albums';
let amazonPath = 'http://s3.eu-central-1.amazonaws.com/kepkukkanto';

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

// HELPER FUNCTION
function filterExtensions (images) {
    return images.filter(function(image){
        return image.toLowerCase().indexOf('.jpg') !== -1 ||
            image.toLowerCase().indexOf('.png') !== -1 ||
            image.toLowerCase().indexOf('.jpeg') !== -1 ||
            image.toLowerCase().indexOf('.gif') !== -1;
    });
}

class Album {

    getThumbnails () {
        //let sourceFolder = path.join(
        //    __dirname, '..',
        //    'public/img/albums', this.albumName);

        let listOfThumbnails = [];
        let albumName = this.albumName;

        // read the thumbs folder of the album, return a list of Picture objects
        return new Promise(function (resolve, reject) {
            console.log(albumName);

            fsImpl.readdir(path.join(albumsFolder, albumName, 'thumb'), function (err, thumbs) {
                    if(err) reject(err);
                    resolve ([thumbs, albumName]);

                })
        })
            .then(function ([thumbs, albumName]) {
                // work only with supported file formats
                console.log(albumName);
                let filteredThumbs = filterExtensions(thumbs);
                for (let key in filteredThumbs) {

                    // use sizeOf to measure horizontal and vertical dimensions for proper image display
                    //let thumbsDimensions = sizeOf(path.join(amazonPath, albumsFolder, 'thumb', thumbs[key]));

                    // create Picture objects
                    let src = path.join(amazonPath, albumsFolder, albumName, 'thumb', thumbs[key]); //`../public/img/albums/${this.albumName}/thumb/${thumbs[key]}`;
                    let link = path.join(amazonPath, albumsFolder, albumName, 'medium', 'med_' + thumbs[key].slice(3)); //`../public/img/albums/${this.albumName}/medium/med_${thumbs[key].slice(3)}`;
                    let alt = thumbs[key].slice(0, -4);
                    let thumbnail = new Picture(src, link, alt, albumName, 180, 240);
                    listOfThumbnails.push(thumbnail);

                } // end for in loop
                return listOfThumbnails;
            });

    };


    constructor({albumName, albumDate = 2017} = { }) {
        this.albumName = albumName;
        this.albumDate = albumDate;
        this.albumCover = "";
        this.albumLink = `albums/${albumName}`;
        this.albumDLfull = `/download/${albumName}full`;
    }
} // end of album
module.exports = Album;