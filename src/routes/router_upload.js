const express = require('express');
const router = express.Router();
const multer = require('multer');
const app = new express();
const bodyParser = require('body-parser');
const path = require('path');
const resizer = require('../resizer.js');
const fileOperations = require('../aws_upload_fileoperations.js');
const fs = require('fs');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

router.get('/upload', (req, res, next) => {
    res.redirect('/');
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

// setting up limits (max 5MB/picture, max 50 pictures at once)
var limits = {
    fileSize : 5000000,
    files: 50

};

// setting up multiple file upload
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


router.post('/upload', (req,res,next)=> {    console.log('any logs????');
}, upload.array('image', 100), (req, res, next) => {

    // MAGIC HAPPENS HERE - check upload folder, count exsiting albums, resize pictures, zip, delete files from upload folder
    fileOperations.resizeZipDelete(req.body.albumName);
    res.redirect('/');
});

module.exports = router;