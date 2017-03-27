const http = require('http');
var path = require('path');

const url = '127.0.0.1';
const port = 3000;
const router = require('./router');

var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    js: 'application/javascript',
    zip: 'application/zip'
};

http.createServer(function (request, response) {
    // set Content-Type for all
    var reqpath = request.url.toString().toLowerCase().split('?')[0];
    var type = mime[path.extname(reqpath).slice(1)] || 'text/html';
    response.setHeader('Content-Type', type);

    //implement routing by file type
    if(request.url.indexOf('.css') !== -1){
        router.css(request, response);
    } else if(request.url.indexOf('.js') !== -1){
        router.js(request, response);
    } else if(
        request.url.toLowerCase().indexOf('.jpg') !== -1 ||
        request.url.toLowerCase().indexOf('.gif') !== -1 ||
        request.url.toLowerCase().indexOf('.png') !== -1){
        router.img(request, response);
    } else if(request.url.toLowerCase().indexOf('.zip') !== -1){
        router.zip(request, response);
    }

    else {
        if (request.url.indexOf('index?album') !== -1) {
            router.album(request, response);
        }
        else if (request.url === '/login'){
            router.login(request, response);
        }
        else if (request.url === '/upload'){
            router.upload(request, response);
        }
        else if(request.url === '/index') {
            router.index(request, response);
        }

    }
}).listen(port, url, function () {
    console.log(`Server is running at ${url} on port ${port}.`)
});

// TODO new site structure - FE - 0,5h
        // new wireframes (on paper)
            // login (simple page, clicking through
            // displaying albums (current structure / move links down, make image shorter)
            // displaying getThumbnails - add back button, show only album cover with long (ribbon) header picture and title
            // upload  button
            // upload page (routing, rendering)
        // html structure: upload button, page-flow(login-albums-album / upload, back buttons
// TODO revise router - BE - 2h
        // add new routes - login, index, upload, albums, album
        // implement MIME types array
        // implement better logic to separate routes
// TODO Refactor Albums and Pictures into classes with getters and setters BE - 2h
    // TH video
    // refactoring
    //      geters setters (set date, title, cover, uploader, get pictures)
    //      by removing the random cover generator from Album only one file is read


// TODO implement upload functionality - FE - implement of simple html, routing/rendering cames later - 2h
        // upload page html (form)
            // add new album (title, date, description, uploader)
            // add images
            // show 1/2 after each other (show/hide)
            // input validation (no double title, fields completed)
            // bulk upload (select more images)
// TODO implement upload functionality - BE - 4h
        // create folder
        // writeFile
        // integrate resizer - remove hard coded album name
        // write zip generator and integrate

// TODO - Design FE - 4h
        // revise design elements (sizes, colors, positions) - login page (big bg, centered) albums view, single album view
        // implement media queries in CSS
// TODO - test release Amazon - 4h
        // Amazon install guide
        // upload, setup