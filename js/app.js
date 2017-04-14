const http = require('http');
const express = require('express');
var path = require('path');
const bodyParser = require('body-parser');

const app = express();
const router = require('../routes/router.js');

//const url = '127.0.0.1';
//const port = 3000;

//var mime = {
//    html: 'text/html',
//    txt: 'text/plain',
//    css: 'text/css',
//    gif: 'image/gif',
//    jpg: 'image/jpeg',
//    png: 'image/png',
//    svg: 'image/svg+xml',
//    ico: 'image/x-icon',
//    js: 'application/javascript',
//    zip: 'application/zip'
//};

app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname + 'public')));

app.use('/', router);

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
        status: err.status
    });
});

app.listen(3000, function(){
    console.log('Express server is running on port 3000');
});