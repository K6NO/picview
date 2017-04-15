const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const router = require('../routes/router.js');
const albumService = require('./albumservice.js');
const Album = require('./album.js');

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, '..', 'public')));


app.get('/', (req, res, next) => {
    console.log('GET request to /');
    let albums = albumService.getAlbumsList({});
    let album = albumService.getSingleAlbum({});

    res.render('index', {
        singleAlbum : album,
        albums : albums
    });
});

app.get('/:albumId', (req, res, next) => {
    let album = albumService.getSingleAlbum({albumName : req.params.albumId});
    let albums = albumService.getAlbumsList({});
    res.render('album', {
        singleAlbum : album,
        albums : albums
    });
});

app.get('/login', (req, res, next) => {
    res.render('login');
});

app.get('/upload', (req, res, next) => {
    res.render('upload');
});




// Error handlers
// 404
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// development error handler / will print stacktrace
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        status: err.status,
        error : err
    });
});

app.listen(3000, function(){
    console.log('Express server is running on port 3000');
});