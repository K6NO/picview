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