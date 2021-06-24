
const fs = require('fs').promises;
const exec = require('child_process').execFile;
const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 5000

express()
  .get(/^\//, listener)
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))


// maps file extention to MIME types
// full list can be found here: https://www.freeformatter.com/mime-types-list.html
const mimeType = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.doc': 'application/msword',
    '.eot': 'application/vnd.ms-fontobject',
    '.ttf': 'application/x-font-ttf',
  };

function listener(req, res) {
    var path = req.url.replace(/%20/g, " ")
    console.log("[" + new Date() + "] " + req.method + " -> " + req.socket.remoteAddress + ":" + req.socket.remotePort + " : " + path)

    if (path == "/" || path[1]=="?") {
        path = "/index.html";
    }
    if (path == "/favicon.ico") {
        path = "/img/favicon.ico"
    }
    path = "/server/website" + path;
    if (path.slice(0,path.indexOf('?')+1) == "/server/website/getMove?") {
        let params = new URLSearchParams( path.split("?")[1])
        getMove(params.get('fen'), params.get('depth'),res)
        return
    }
    let ext = path.slice(path.indexOf('.'))
    fs.readFile("." + path)
    .then(contents => {
        res.setHeader("Content-Type", mimeType[ext] || 'text/plain');
        res.writeHead(200);
        res.end(contents);
    })
    .catch(err => {
        res.writeHead(500);
        console.log(err);
        res.end("No such file");
    return;
    });
}
