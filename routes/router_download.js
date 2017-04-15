const express = require('express');
const router = express.Router();

router.get('/download/:album/:size', (req, res, next) => {
    console.log('download');
    res.download(__dirname + '/..' + '/public/' + 'img/albums/' + req.params.album + '/zip/' + req.params.album + '_' + req.params.size + '.zip');
});

module.exports = router;