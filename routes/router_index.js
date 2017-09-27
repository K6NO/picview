const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const express = require('express');
const router = express.Router();
const Album = require('../js/album.js');
const moment = require('moment');
const path = require('path');


const albumsFolder = 'public/img/albums';

router.use('/', require('./router_upload.js'));
router.use('/', require('./router_login.js'));
router.use('/', require('./router_download.js'));

router.get('/', (req, res, next) => {
    fs.readdirAsync(albumsFolder)
        .then((albums)=> {
            let albumsList = [];
            for (let key in albums){
                if(albums[key].indexOf('.') === -1) {
                    let albumName = albums[key];
                    let albumDate = moment().format('YYYY');
                    let album = new Album({albumName: albumName, date: albumDate});
                    album.albumCover = path.join('/img/albums/' + albumName + '/thumb/' + fs.readdirSync(path.join(albumsFolder, albumName, 'thumb'))[0]);
                    albumsList.push(album);
                    }
                }
            return albumsList;
        })
        .then((albumsList)=> {
            res.render('index', {
                albums : albumsList
        });
    });
});

router.get('/albums/:albumId', (req, res, next) => {
    let album = new Album({albumName: req.params.albumId});
    album.getThumbnails()
        .then((pictures)=>{
            res.render('album', {
                singleAlbum : album,
                pictures : pictures
            });
        });


});


module.exports = router;
