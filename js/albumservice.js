const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const moment = require('moment');
const Album = require('./album.js');

//const Picture = require('./picture.js');
const albumsFolder = 'public/img/albums';

module.exports.getSingleAlbum = (config) => {
    let albumName = config.albumName;
    if (albumName === undefined) albumName = '2_rotterdam';
    let album = new Album({albumName: albumName});
    return album;
};
