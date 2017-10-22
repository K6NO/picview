const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const express = require('express');
const Album = require('./album.js');
const moment = require('moment');
const path = require('path');
const albumsFolder = 'public/img/albums';

function chooseRandomCoverAndReturnAlbumsList(albumThumbsList, albumsList) {
    // iterate the resolved promises (list of thumb files)
    return new Promise(function (resolve, reject) {
        for (let key in albumThumbsList) {

            // choose a random image from the thumbs (need to treat single image separately)
            let randomiser;
            if(albumThumbsList[key].length > 1){
                randomiser = Math.floor(Math.random() * albumThumbsList[key].length);
            } else {
                randomiser = 0;
            }

            // add the albumCover on matching Album objects --> key in here needs to correspond to key in the above iteration
            // fortunately promiseStack resolves in the same order as the promises were pushed in the list above
            albumsList[key].albumCover = path.join('/img/albums/' + albumsList[key].albumName + '/thumb/' + albumThumbsList[key][randomiser]);


        }
        resolve(albumsList);
    })
}

function buildListOfAlbumsAndReadThumbFolders(albums){
    let albumsList = [];
    let promiseStack = [];

    // iterate list list of album folders
    for (let key in albums){

        // exclude any files, other shit
        if(albums[key].indexOf('.') === -1) {

            // create Album instances, push it to a list
            let albumName = albums[key];
            let albumDate = moment().format('YYYY');
            let album = new Album({albumName: albumName, date: albumDate});
            albumsList.push(album);

            // async read the thumb subfolder in each album folder, push the promises to a list
            promiseStack.push(fs.readdirAsync(path.join(albumsFolder, albumName, 'thumb')));
        }
    }
    return { albumsList : albumsList,
        promiseStack : promiseStack
    }
}

// async get list of album folders
function returnAlbumsToDisplayWithCover(albumsFolder){
    return fs.readdirAsync(albumsFolder)
        .then((albums)=> {
            let albumsList =  buildListOfAlbumsAndReadThumbFolders(albums).albumsList;
            let promiseStack =  buildListOfAlbumsAndReadThumbFolders(albums).promiseStack;


            // resolve all concurrent promises at once --> will be several list of thumb files
            return Promise.all(promiseStack).then((albumThumbsList)=> {
                console.log('after resolving promises');
                return chooseRandomCoverAndReturnAlbumsList(albumThumbsList, albumsList)

            });
        })
}

module.exports.returnAlbumsToDisplayWithCover = returnAlbumsToDisplayWithCover;