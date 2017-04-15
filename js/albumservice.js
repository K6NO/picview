const fs = require('fs');
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

//module.exports.getSingleAlbum = (config) => {
//    return (req, res, next) => {
//        let album = new Album({albumName: config.albumName});
//        req.singleAlbum = album;
//        next();
//    }
//};

module.exports.getAlbumsList = (config) => {
    let albums = fs.readdirSync(albumsFolder);
    let albumsList = [];
    for (let key in albums){
        if(albums[key].indexOf('.') === -1) {
            let albumName = albums[key];
            let albumDate = config.albumDate;
            if (albumDate === 'undefined') albumDate = moment().format('YYYY');
            let album = new Album({albumName: albumName, date: albumDate});
            albumsList.push(album);
        }
    }
    return albumsList;
};

//module.exports.getAlbumsList = (config) => {
//    return (req, res, next) => {
//        let albums = fs.readdirSync(albumsFolder);
//        let albumsList = [];
//        for (let key in albums){
//            if(albums[key].indexOf('.') === -1) {
//                let albumName = albums[key];
//                let albumDate = config.albumDate;
//                if (albumDate === 'undefined') albumDate = moment().format('YYYY');
//                let album = new Album({albumName: albumName, date: albumDate});
//                albumsList.push(album);
//            }
//        }
//        req.albums = albumsList;
//        next();
//    }
//};
