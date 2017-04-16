const express = require('express');
const router = express.Router();
const multer = require('multer');
const app = new express();
const bodyParser = require('body-parser');
const path = require('path');

const resizer = require('../js/resizer.js');

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
    console.log(req.files);

    // RESIZING ...
    resizer.resizeImages(__dirname + '/..' + '/public' + '/img/upload/', ['thumb', 'medium'], 'newalbum');

    res.send(req.body);
});

module.exports = router;