const express = require('express');
const router = express.Router();
const mid = require('../auth_middleware.js');


router.get('/download/:album/:size',mid.requiresLogin, (req, res, next) => {
    console.log('download');
    res.download(__dirname + '/../..' + '/public/' + 'img/albums/' + req.params.album + '/zip/' + req.params.album + '_' + req.params.size + '.zip');
});

module.exports = router;