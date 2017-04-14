const fs = require('fs');

function upload(fileName, fileSize) {
    let jsonFile = fs.readFileSync('./img/upload/storedFilesList.json', 'utf-8');
    let jsonObject = JSON.parse(jsonFile);

    jsonObject.storedFiles[fileName] = {
        size: fileSize,
        expDate: '-',
        path: '/upload/' + fileName
    };
    let jsonString = JSON.stringify(jsonObject, null, 4);


    fs.writeFile('./img/upload/storedFilesList.json', jsonString, function (err) {
        if (err) throw err;
    });
}

module.exports.upload = upload;