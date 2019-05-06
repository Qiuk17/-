const fs = require('fs');

let borders = [], decorators = [];
const pngHeader = "data:image/png;base64,";

fs.readdir("./borders", (err, files) => {
    for (fileName in files) {
        if (files[fileName].indexOf('png') === -1) continue;
        let buf = fs.readFileSync("./borders/" + files[fileName]);
        borders[fileName] = {
            name: files[fileName],
            content: pngHeader + Buffer.from(buf, 'binary').toString('base64')
        };
    }
});

fs.readdir("./decorators", (err, files) => {
    for (fileName in files) {
        if (files[fileName].indexOf('png') === -1) continue;
        let buf = fs.readFileSync("./decorators/" + files[fileName]);
        decorators[fileName] = {
            name: files[fileName],
            content: pngHeader + Buffer.from(buf, 'binary').toString('base64')
        };
    }
});

setTimeout(() => {
    fs.writeFileSync("./data", JSON.stringify({borders: borders, decorators: decorators}, null, 4));
}, 4000);