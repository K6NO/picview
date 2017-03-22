var fs = require("fs");

function mergeValues(content, values){
    for(let key in values){
        content = content.replace("{{" + key + "}}", values[key]);
    }
    return content;
}

function view(templateName, values, response){
    let fileContents = fs.readFileSync(`views/${templateName}.html`, 'utf8');
    fileContents = mergeValues(fileContents, values);
    response.write(fileContents);
}

module.exports.view = view;