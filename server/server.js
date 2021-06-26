
const fs = require('fs').promises;
const exec = require('child_process').execFile;
const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 5000

express()
  .use(express.json())
  .get(/^\//, listener)
  .post(/^\//, postListener)
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
    if (req.method == "POST") return postListener(req, res);
    if (path == "/" || path[1]=="?") {
        path = "/index.html";
    }
    if (path == "/login") return login(req, res)
    if (path == "/favicon.ico") {
        path = "/assets/favicon.ico"
    }
    if (path.endsWith("?filter")) return filterListener(req, res);
    if (path == "/get_eliminatie") return eliminatieConfig(req, res)
    if (path.startsWith("/get_results?")) return getResults(req, res, path.split("?")[1])
    if (path.startsWith("/get_intput_vragen?")) return getInput_vragen(req, res, path.split("?")[1])
    if (path.startsWith("/data")) {
        path = "/server" + path;
    } else {
        path = "/server/website" + path;
    }
    if (path.slice(0,path.indexOf('?')+1) == "/server/website/getMove?") {
        let params = new URLSearchParams( path.split("?")[1])
        getMove(params.get('fen'), params.get('depth'),res)
        return
    }
    if (path.slice(0,path.indexOf('?')+1) == "/server/website/addUser?") {
        addUser("test", "ww")
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

function filterListener(req, res) {
    let path = "/server" + req.url.split("?")[0]
    fs.readFile("."+path).then(content => {
        let message = JSON.parse(content).map(e => {
            let d = {"vraag": e.vraag,
                     "opties": e.opties,
                     "type": e.type}
            return d
        })
        res.writeHead(200)
        res.end(JSON.stringify(message))
    }).catch(err => {
        res.writeHead(500);
        console.log(err);
        res.end(err.toString());
    })
}

function postListener(req, res) {
    var path = req.url.replace(/%20/g, " ")
    console.log("[" + new Date() + "] " + req.method + " -> " + req.socket.remoteAddress + ":" + req.socket.remotePort + " : " + path)
    if (req.url.endsWith("new_input_vragen")) {
        let post = req.body
        fs.mkdir("./server/data/eliminatie/"+post.naam)
        .then(re => {
            pushFile("./server/data/eliminatie/"+post.naam+"/vragen.json", JSON.stringify(post.data), res)
        })
        .catch((err)=> {
            res.writeHead(500)
            res.end(err.toString())
        })
    }

    if (req.url.endsWith("save_input_vragen")) {
        let post = req.body
        pushFile("./server/data/eliminatie/"+post.naam+"/vragen.json", JSON.stringify(post.data), res)
    }

    if (req.url.endsWith("del_eliminatie_folder")) {
        let post = req.body
        fs.rmdir("./server/data/eliminatie/"+post.filename, {recursive:true})
        .then(re => {
            res.writeHead(200)
            res.end("")
        })
        .catch((err)=> {
            res.writeHead(500)
            res.end(err.toString())
        })
    }
    if (req.url.endsWith("send_eliminatie")) {
        let post = req.body
        pushFile("./server/data/eliminatie/"+post.eliminatie+"/"+post.deelnemer+"_"+new Date().getTime()+".json", JSON.stringify(post), res)
    }
    if (req.url.endsWith("update_config")) {
        try {
            fs.writeFile("./server/data/eliminatie/config.json", JSON.stringify(req.body))
            res.writeHead(200);
            res.end("");
        } catch(err) {
            console.log(err)
            res.writeHead(500);
            res.end(err);
        }
    }
}

function eliminatieConfig(req, res) {
    let dirs
    let message = {}
    fs.readdir("./server/data/eliminatie")
    .then(dir => {
        dirs = dir.filter(v => v.indexOf(".")==-1)
        return Promise.all(dirs.map(v => fs.readdir("./server/data/eliminatie/"+v)))
    }).then(responses => {
        responses.forEach((response, index) => {
            message[dirs[index]] = response.length-1
        })
        res.setHeader("Content-Type", 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify(message));
    }).catch((err) => {
        console.log(err)
        res.writeHead(500);
        res.end("error");
    })
}

function getResults(req, res, file) {
    fs.readdir("./server/data/eliminatie/"+file).then(dir => {
        return Promise.all(dir.filter(v => v != "vragen.json").map(v => fs.readFile("./server/data/eliminatie/"+file+"/"+v)))
    }).then(responses => {
        let message = responses.map(v => JSON.parse(v))
        res.writeHead(200);
        res.end(JSON.stringify(message));
    })
}

function getInput_vragen(req, res, filename) {
    fs.readFile("./server/data/eliminatie/"+filename+"/vragen.json")
    .then(contents => {
        res.setHeader("Content-Type", 'application/json');
        res.writeHead(200);
        res.end(contents);
    })
    .catch(err => {
        res.writeHead(500);
        console.log(err);
        res.end("No such file");
        return;
    })
}

function addUser(naam, wachtwoord) {
    let new_user = {
        "naam": naam,
        "wachtwoord": wachtwoord,
        "key": Math.random().toString(16).substr(2)
    }
    fs.readFile("./server/data/user.json")
        .then(content => {
            let users = JSON.parse(content)
            users.push(new_user);
            return fs.writeFile("./server/data/user.json", JSON.stringify(users))
        })
        .then();
}

function changePassword(name, old_pw, new_pw) {
    fs.readFile("./server/data/user.json")
        .then(content => {
            let users = JSON.parse(content)
            let user = users.find((item, index, arr) => item.naam == name && item.wachtwoord == old_pw)
            if (user) {
                user.wachtwoord = new_pw;
                return fs.writeFile("./server/data/user.json", JSON.stringify(users))
            } else {
                throw new Error("incorrect password or name.")
            }
        })
        .catch(err => {
            res.writeHead(200);
            res.end(err.toString());
        })
}

function login(req, res) {
    fs.readFile("./server/data/user.json")
        .then(content => {
            let login = JSON.parse(req.get("login"))
            let users = JSON.parse(content)
            let user = users.find((item, index, arr) => item.naam == login.name && item.wachtwoord == login.ww)
            if (user) {
                res.writeHead(200)
                res.end(JSON.stringify({key: user.key}))
                return
            } else {
                throw new Error("incorrect password or name.")
            }
        })
        .catch(err => {
            res.writeHead(500);
            res.end(err.toString());
        })
}

function pushFile(path, content, res) {
    fs.writeFile(path, content)
        .then(wf => {
            res.writeHead(200)
            res.end("");
        })
        .catch(err => {
            res.writeHead(500)
            res.end(err.toString());
        })
}
