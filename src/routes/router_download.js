const express = require('express');
const router = express.Router();
const mid = require('../auth_middleware.js');
const path = require('path');


let amazonPath = 'http://s3.eu-central-1.amazonaws.com/kepkukkanto';
const albumsFolder = '/public/img/albums/';


router.get('/download/:album/:size',mid.requiresLogin, (req, res, next) => {
    console.log('download');
    console.log(amazonPath + albumsFolder + req.params.album + '/zip/' + req.params.album + '_' + req.params.size + '.zip');
    res.redirect(amazonPath + albumsFolder + req.params.album + '/zip/' + req.params.album + '_' + req.params.size + '.zip');
});

module.exports = router;