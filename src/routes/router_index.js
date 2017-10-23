const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const express = require('express');
const router = express.Router();
const Album = require('../album.js');
const moment = require('moment');
const path = require('path');
const mid = require('../auth_middleware.js');

const AwsFileOperations = require('../aws_download_fileoperations');
    //require('../download_fileoperations');

const S3FS = require('s3fs');
const bucketPath = process.env.S3_BUCKET_NAME || 'kepkukkanto';
const access_key = process.env.AWS_ACCESS_KEY_ID || require('../../secret.json').access_key;
const secret = process.env.AWS_SECRET_ACCESS_KEY || require('../../secret.json').secret;
let s3Options = {
    region: 'eu-central-1',
    accessKeyId : access_key,
    secretAccessKey : secret
};
let fsImpl = new S3FS(bucketPath, s3Options);

const albumsFolder = 'public/img/albums';

router.use('/', require('./router_upload.js'));
router.use('/', require('./router_auth.js'));
router.use('/', require('./router_download.js'));




router.get('/', mid.requiresLogin, (req, res, next) => {

    let albumsToDisplay = AwsFileOperations.returnAWSAlbumsToDisplayWithCover(albumsFolder);
        albumsToDisplay.then((albumsListWithCover)=> {
            res.render('index', {
                albums : albumsListWithCover,
                user: req.session.userId
        });
    });
});

router.get('/albums/:albumId', mid.requiresLogin, (req, res, next) => {
    let album = new Album({albumName: req.params.albumId});
    album.getThumbnails()
        .then((pictures)=>{
            res.render('album', {
                singleAlbum : album,
                pictures : pictures,
                user: req.session.userId
            });
        });


});


module.exports = router;
