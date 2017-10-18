const archiver = require('archiver');
const fs = require('fs');
const appRootDir = require('app-root-dir').get();


let outputFile = fs.createWriteStream(__dirname + '/test.zip');
let archive = archiver('zip', {
    zlib: {level: 9}
});

outputFile.on('close', ()=> {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver finalized');
});

archive.on('warning', (err)=> {
   if(err.code === 'ENOENT') {
       console.error(err);
   } else {
       throw err;
   }
});

archive.on('error', (err)=> {
    throw err;
});

archive.pipe(outputFile);
console.log(appRootDir);
//archive.file(appRootDir + '/public/img/albums/5_screenshots/thumb/th_Screen Shot 2017-09-15 at 16.37.08.png', {name: 'ujfile.png'});
archive.directory(appRootDir + '/public/img/albums/5_screenshots/thumb/', false);
archive.finalize();