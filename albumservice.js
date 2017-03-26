const fs = require('fs');
const moment = require('moment');
const Album = require('./album.js');

//const Picture = require('./picture.js');
const albumsRootFolder = './img/albums';


function getSingleAlbum(albumName){
    let album = new Album({albumName: albumName});
    return album;
}

function getAlbumsList(albumDate){

    let albums = fs.readdirSync(albumsRootFolder);
    let albumsList = [];
    for (let key in albums){
        if(albums[key].indexOf('.') === -1) {
            let albumName = albums[key];
            if (albumDate === 'undefined') albumDate = moment().format('YYYY');
            //let albumImages = getThumbnails(albumName);

            let album = new Album({albumName: albumName, date: albumDate});
            albumsList.push(album);
        }
    }
    return albumsList;
}

module.exports.readAlbums = getAlbumsList;
module.exports.getSingleAlbum = getSingleAlbum;
