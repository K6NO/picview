const url = require('url');
const fs = require('fs');
const path = require('path');
const renderer = require('./renderer');
const imagereader = require('./imagereader.js');

function login (request, response) {
    if(request.method.toLowerCase() === 'get') {
        renderer.view('header', {}, response);
        renderer.view('login', {}, response);
        renderer.view('footer', {}, response);
        response.end();
    } else {
        // implement POST
        console.error('Error! Method: ' +request.method + ' Only method GET is supported.');
    }
}

function index (request, response) {
    if(request.method.toLowerCase() === 'get') {
        let albums = imagereader.readAlbums('2017-02-03');
        renderer.view('header', {}, response);
        renderer.view('albums_ul', {}, response);

        for(let album=0; album<albums.length; album++){
            let albumValues = {};
            for (let key in albums[album]){
                albumValues[key] = albums[album][key];
            }
            renderer.view('albums', albumValues, response);
        }
        renderer.view('albums_xul', {}, response);
        renderer.view('footer', {}, response);
        response.end();
    } else {
        console.error('Error! Method: ' +request.method + ' Only method GET is supported.');
    }
}

function album (request, response) {
    let urlObject = url.parse(request.url);
    if(request.method.toLowerCase() === 'get'){
        let query = urlObject.query;
        let albumName = query.split('=')[1];
        let albums = imagereader.readAlbums('2017-02-03');
        let thumbs = imagereader.readThumbnails(albumName);

        renderer.view('header', {}, response);
        renderer.view('albums_ul', {}, response);

        for(let album=0; album<albums.length; album++){
            let albumValues = {};
            for (let key in albums[album]){
                albumValues[key] = albums[album][key];
            }
            renderer.view('albums', albumValues, response);
        }

        renderer.view('content_xul', {}, response);
        renderer.view('content_ul', {}, response);

        for (let picture=0; picture<thumbs.length; picture++){

            var values = {};
            for(let key in thumbs[picture]){
                values[key] = thumbs[picture][key];
            }
            renderer.view('content', values, response);
        }
        renderer.view('content_xul', {}, response);
        renderer.view('footer', {}, response);
        response.end();
    } else {
        console.error('Error! Method: ' +request.method + ' Only method GET is supported.');
    }
}

function upload (request, response) {
    // if get - display elements
    // if post - receive pictures, save, send back OK message - render OK message (jQuery)
    if(request.method.toLowerCase() === 'get') {
        renderer.view('header', {}, response);
        renderer.view('upload', {}, response);
        renderer.view('footer', {}, response);
        response.end();
    } else {
        // implement POST
        console.error('Error! Method: ' +request.method + ' Only method GET is supported.');
    }
}

function zip (request, response) {
    let reqpath = request.url.toString().toLowerCase().split('?')[0];
    let parsedPath = path.parse(reqpath);
    let size = parsedPath.dir.split('/')[3];
    let album = parsedPath.dir.split('/')[2];
    let zipFile = fs.readFileSync(`./img/albums/${album}/zip/${album}_${size}.zip`);
    response.write(zipFile);
    response.end();
}

function css(request, response){
    let cssFile = fs.readFileSync('.' + request.url, 'utf8');
    response.write(cssFile);
    response.end();
}

function js(request, response){
    let jsFile = fs.readFileSync('.' + request.url, 'utf8');
    response.write(jsFile);
    response.end();
}

function img(request, response){
    let imageFile = fs.readFileSync('.' + request.url);
    response.write(imageFile, 'binary');
    response.end();
}

module.exports.login = login;
module.exports.index = index;
module.exports.album = album;
module.exports.upload = upload;
module.exports.css = css;
module.exports.js = js;
module.exports.img = img;
module.exports.zip = zip;
