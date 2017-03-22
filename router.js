const url = require('url');
const fs = require('fs');
const renderer = require('./renderer');
const imagereader = require('./imagereader.js');

function album (request, response) {
    let urlObject = url.parse(request.url);
    if(request.method.toLowerCase() === 'get'){
        let query = urlObject.query;
        let albumName = query.split('=')[1];
        let albums = imagereader.readAlbums('2017-02-03');
        let thumbs = imagereader.readThumbnails(albumName);

        response.writeHead(200, {'Content-Type': 'text/html'});
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


function index (request, response) {
    if(request.method.toLowerCase() === 'get') {
        let albums = imagereader.readAlbums('2017-02-03');

        response.writeHead(200, {'Content-Type': 'text/html'});
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

function zip (request, response) {
    let urlObject = url.parse(request.url);
    let query = urlObject.query;
    let size = query.split('=')[2].split('&')[0];
    let album = query.split('=')[1].split('&')[0];
    response.writeHead(200, {'Content-Type' : 'application/zip'});
    let zipFile = fs.readFileSync(`./img/albums/${album}/zip/${album}_${size}.zip`);
    response.write(zipFile);
    response.end();
}

function css(request, response){
    response.writeHead(200, {'Content-Type': 'text/css'});
    let cssFile = fs.readFileSync('.' + request.url, 'utf8');
    response.write(cssFile);
    response.end();
}

function js(request, response){
    response.writeHead(200, {'Content-Type': 'application/javascript'});
    let jsFile = fs.readFileSync('.' + request.url, 'utf8');
    response.write(jsFile);
    response.end();
}

function img(request, response){
    response.writeHead(200, {'Content-Type': 'image/jpeg'});
    let imageFile = fs.readFileSync('.' + request.url);
    response.write(imageFile, 'binary');
    response.end();
}

function gif(request, response){
    response.writeHead(200, {'Content-Type' : 'image/gif'});
    let gifFile = fs.readFileSync('.' + request.url);
    response.write(gifFile);
    response.end();
}

module.exports.index = index;
module.exports.album = album;
module.exports.css = css;
module.exports.js = js;
module.exports.img = img;
module.exports.zip = zip;
module.exports.gif = gif;