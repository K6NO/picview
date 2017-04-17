const express = require('express');
const router = express.Router();
const multer = require('multer');
const app = new express();
const bodyParser = require('body-parser');
const path = require('path');
const appRootDir = require('app-root-dir').get();
const resizer = require('../js/resizer.js');
const fs = require('fs');
const archiver = require('archiver');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

router.get('/upload', (req, res, next) => {
    res.render('upload');
});


// setting up storage and file naming
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/upload')
    },
    filename: function (req, file, cb) {
        let extension = file.originalname.split('.')[0];
        cb(null, file.originalname);
    }
});

// setting up limits (max 10MB/picture, max 100 pictures at once)
var limits = {
    fileSize : 10000000,
    files: 100

};


var upload = multer({
    limits: limits,
    fileFilter : function(req, file, cb) {
        let acceptedFileTypes = /jpeg|jpg|gif|png/;
        let mimetype = acceptedFileTypes.test(file.mimetype);
        let extname = acceptedFileTypes.test(path.extname(file.originalname).toLowerCase());

        if(mimetype && extname){
            return cb(null, true);
        }
        cb(new Error('Unsupported file type. Supported formats: jpg, jpeg, gif, png.'));
    },
    storage: storage,
    onError: (err, next) => {
        console.log(err);
        next(err);
    }
});

router.post('/upload', upload.array('image', 100), (req, res, next) => {

    // RESIZING ...
    resizer.resizeImages(appRootDir + '/public/img/upload/', req.body.albumName);
    next();

}, (req, res, next) => {
    // ARCHIVER
    var output = fs.createWriteStream(__dirname + '/' + req.body.albumName + '.zip');
    var archive = archiver('zip');
    
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    output.on('error', function (err) {
        next(err);
    });

    archive.pipe(output);
    archive.directory(appRootDir + '/public/img/upload/', req.body.albumName);
    archive.finalize();
    next();

}, (req, res, next) => {
    // DELETE ...
    fs.readdir(appRootDir + '/public/img/upload/', (err, files) => {
        if(!err) {
            for (let key in files){
                fs.unlink(appRootDir + '/public/img/upload/' + files[key], (err) => {
                    if (err) return new Error('Error when attempting to delete upload folder.')
                })
            }
        } else {
            return new Error('Error when attempting to read upload folder.')
        }
    });
    res.redirect('/');
});

module.exports = router;