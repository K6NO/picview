const fs = require('fs');
const Album = require('./album.js');
const moment = require('moment');
const path = require('path');

let albumsFolder = 'public/img/albums';
let amazonPath = 'http://s3.eu-central-1.amazonaws.com/kepkukkanto';

const S3FS = require('s3fs');
const bucketPath = process.env.S3_BUCKET_NAME || 'kepkukkanto';
const access_key = process.env.AWS_ACCESS_KEY_ID || require('../secret.json').access_key;
const secret = process.env.AWS_SECRET_ACCESS_KEY || require('../secret.json').secret;
let s3Options = {
    region: 'eu-central-1',
    accessKeyId : access_key,
    secretAccessKey : secret
};
let fsImpl = new S3FS(bucketPath, s3Options);

// remove appRootDir when using AWS
const sharp = require('sharp'); // Sharp resize documentation: http://sharp.dimens.io/en/stable/api-resize/
const archiver = require('archiver');

function readdirPromise (dirpath) {
    return new Promise(function (resolve, reject) {
        fsImpl.readdir(dirpath, function (err, files) {
            if(err) reject(err);
            resolve(files);
        })
    })
}

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
            albumsList[key].albumCover = path.join(amazonPath, albumsFolder, albumsList[key].albumName, 'thumb', albumThumbsList[key][randomiser]);


        }
        resolve(albumsList);
    })
}

function buildListOfAlbumsAndReadThumbFolders(albums){
    let albumsList = [];
    let promiseStack = [];

    // iterate list of album folders
    for (let key in albums){

        // exclude any files, other shit
        if(albums[key].indexOf('.') === -1) {

            // create Album instances, push it to a list
            let albumName = albums[key];
            let albumDate = moment().format('YYYY');
            let album = new Album({albumName: albumName, date: albumDate});
            albumsList.push(album);

            // async read the thumb subfolder in each album folder, push the promises to a list
            promiseStack.push(readdirPromise(path.join(albumsFolder, albumName, 'thumb'))
                .then(function (promise) {
                    return promise;
                })
                .catch(function(err){
                    return err;
                }));
        }
    }
    return { albumsList : albumsList,
        promiseStack : promiseStack
    }
}

// async get list of album folders
function returnAWSAlbumsToDisplayWithCover(albumsFolder){
    return readdirPromise(albumsFolder)
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

module.exports.returnAWSAlbumsToDisplayWithCover = returnAWSAlbumsToDisplayWithCover;