const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const express = require('express');
const router = express.Router();
const Album = require('../album.js');
const moment = require('moment');
const path = require('path');


const albumsFolder = 'public/img/albums';

router.use('/', require('./router_upload.js'));
router.use('/', require('./router_auth.js'));
router.use('/', require('./router_download.js'));

router.get('/', (req, res, next) => {
    // async get list of album folders
    fs.readdirAsync(albumsFolder)
        .then((albums)=> {
            let albumsList = [];
            let promiseStack = [];

            // iterate list list of album folders
            for (let key in albums){

                // exclude any files, other shit
                if(albums[key].indexOf('.') === -1) {

                    // create Album instances, push it to a list
                    let albumName = albums[key];
                    let albumDate = moment().format('YYYY');
                    let album = new Album({albumName: albumName, date: albumDate});
                    albumsList.push(album);

                    // async read the thumb subfolder in each album folder, push the promises to a list
                    promiseStack.push(fs.readdirAsync(path.join(albumsFolder, albumName, 'thumb')));
                }
            }
            // resolve all concurrent promises at once --> will be several list of thumb files
            return Promise.all(promiseStack).then((albumThumbsList)=> {

                // iterate the resolved promises (list of thumb files)
                for (let key in albumThumbsList) {

                    // choose a random image from among the thumbs
                    let randomiser = Math.floor(Math.random() * albumThumbsList[key].length);

                    // add the albumCover on matching Album objects --> key in here needs to correspond to key in the above iteration
                    // fortunately promiseStack resolves in the same order as the promises were pushed in the list above
                    albumsList[key].albumCover = path.join('/img/albums/' + albumsList[key].albumName + '/thumb/' + albumThumbsList[key][randomiser]);


                }
                return albumsList;
            });
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
