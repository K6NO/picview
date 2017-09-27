const express = require('express');
const router = express.Router();
const multer = require('multer');
const app = new express();
const bodyParser = require('body-parser');
const path = require('path');
const appRootDir = require('app-root-dir').get();
const resizer = require('../js/resizer.js');
const fs = require('fs');

const admZip = require('adm-zip');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

//router.get('/upload', (req, res, next) => {
//    res.render('upload');
//});


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

//function resizing (req, res, next) {
//    resizer.resizeImages(appRootDir + '/public/img/upload/', req.body.albumName, function foo(err, user) {
//        if(err) {
//            return res.send(401); ///respond with unauthorized  and do not call the next middleware.
//        }
//        req.body.albumCounter = user; //put the user in the request object so the next middleware can use it
//        next(); //call the next middleware.
//    });
//}

router.post('/upload', upload.array('image', 100), (req, res, next) => {

    //var albumCount = new Promise(function (resolve, reject) {
    //    fs.readdir(albumsFolder, (err, files) => {
    //        if(err) reject(err);
    //        let counter = 0;
    //        for(let entry in files){
    //            if(files[entry].indexOf('.') === -1){
    //                counter ++;
    //            }
    //        }
    //        resolve(console.log(counter));
    //    })
    //});
    // RESIZING ...
    //resizing(req, res, next);
    let albumCounter = resizer.resizeImages(appRootDir + '/public/img/upload/', req.body.albumName);
    console.log('resizer 2');
    req.body.albumCounter = albumCounter;
    next();
}, (req, res, next) => {

    //ZIP
    console.log('zipper 1');
    var zip = new admZip();
    zip.addLocalFolder(appRootDir + '/public/img/upload/');
    zip.writeZip(appRootDir + '/public/img/albums/' + req.body.albumCounter + '_' + req.body.albumName + '/zip/' + req.body.albumCounter + '_' + req.body.albumName + '_full.zip');
    console.log('zipper 2');
    next();

}, (req, res, next) => {
    // DELETE files  from upload...
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