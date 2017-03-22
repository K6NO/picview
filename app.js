const http = require('http');
const url = '127.0.0.1';
const port = 3000;
const router = require('./router');

http.createServer(function (request, response) {
    if(request.url.indexOf('.css') !== -1){
        router.css(request, response);
    } else if(request.url.indexOf('.js') !== -1){
        router.js(request, response);
    }
    else if(request.url.toLowerCase().indexOf('.jpg') !== -1){
        router.img(request, response);
    }
    else if(request.url.toLowerCase().indexOf('zip') !== -1){
        router.zip(request, response);
    } else if (request.url.toLowerCase().indexOf('.gif') !== -1) {
        router.gif(request, response);
    } else if (request.url.toLowerCase().indexOf('.png') !== -1) {
        router.gif(request, response);
    }
    else {
        if (request.url.indexOf('album') !== -1 && request.url.indexOf('size') === -1) {
            router.album(request, response);
        }
        else if(request.url === '/') {
            router.index(request, response);
        }

    }
}).listen(port, url, function () {
    console.log(`Server is running at ${url} on port ${port}.`)
});
// TODO check why readThumbnails is called when only albums are displayed!!!
        // probably by removing the random cover generator from Album
// TODO new site structure
        // login (simple page, clicking through
        // displaying albums
        // upload albums button - separate page (routing, rendering)
        // add frontend responsiveness
// TODO implement upload functionality
        // add new album
        // add images
        // bulk upload
// TODO integrate resizer - remove hard coded album name
// TODO add and integrate zip generator
// TODO revise router
//      implement MIME types array
//      implement better logic to separate routes
// TODO - Design
//      - html structure: upload button, page-flow(login-albums-album / upload, back buttons
//      - revise design (sizes, colors, positions)
//      - implement media queries in CSS