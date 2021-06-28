
const fs = require('fs').promises;
const exec = require('child_process').execFile;
const express = require('express')
const path = require('path')

const PORT = process.env.PORT || 5000

const functionMap = {
    "login": login,
    "protected&all_eliminatie": allEliminatie,
    "protected&eliminatie_results": eliminatieResults,
    "protected&eliminatie_vragen": eliminatieVragen,
    "eliminatie_vragen_filtered": eliminatieVragenFiltered,
    "change_password": changePassword,
}


express()
  .use(express.json())
  .get(/\/data\/user\.json/, listener)
  .get(/\/data\/eliminatie\/config\.json/, listener)
  .get(/^(\/data)/, protectedListener)
  .get(/^(\/protected&)/, protectedListener)
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

// function Publiclistener(req, res) {
//     var path = req.url.replace(/%20/g, " ")
//     console.log("[" + new Date() + "] " + req.method + " -> " + req.socket.remoteAddress + ":" + req.socket.remotePort + " : " + path)
//     if (path == "/" || path[1]=="?") {
//         path = "/index.html";
//     }
//     if (path == "/favicon.ico") {
//         path = "/assets/favicon.ico"
//     }
//     //if (path.endsWith("?filter")) return filterListener(req, res); // fct
//     //if (path.startsWith("/get_results?")) return getResults(req, res, path.split("?")[1])
//     //if (path.startsWith("/get_intput_vragen?")) return getInput_vragen(req, res, path.split("?")[1])
//     if (path.startsWith("/data")) {
//         path = "/server" + path;
//     } else {
//         path = "/server/website" + path;
//     }
//     // if (path.slice(0,path.indexOf('?')+1) == "/server/website/getMove?") {
//     //     let params = new URLSearchParams( path.split("?")[1])
//     //     getMove(params.get('fen'), params.get('depth'),res)
//     //     return
//     // }
//     if (path.slice(0,path.indexOf('?')+1) == "/server/website/addUser?") {
//         addUser("test", "ww")
//         return
//     }
//     let ext = path.slice(path.indexOf('.'))
//     fs.readFile("." + path)
//     .then(contents => {
//         res.setHeader("Content-Type", mimeType[ext] || 'text/plain');
//         res.writeHead(200);
//         res.end(contents);
//     })
//     .catch(err => {
//         res.writeHead(500);
//         console.log(err);
//         res.end("No such file");
//     return;
//     });
// }

/*** LISTENERS ***/

function protectedListener(req, res) {
    function checkAuthorization(req, res) {
        fs.readFile("./server/data/user.json")
        .then(contents => {
            if (JSON.parse(contents).find(v => v.key == req.get("Authorization")).rol != "maker") {
                throw new Error("not autorized")
            }
            listener(req, res)
        })
        .catch(err => {
            res.writeHead(401);
            res.end("not authorized");
            console.log("not authorized")
        })
    }
    
    function listener(req, res) {
        var path = req.url.replace(/%20/g, " ")
        console.log("#protected# [" + new Date() + "] " + req.method + " -> " + req.socket.remoteAddress + ":" + req.socket.remotePort + " : " + path)
        
        // functions
        let fct = functionMap[path.split("/")[1]]
        if (fct != undefined)  return fct(req, res)

        // get files
        path = "/server" + path
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
    checkAuthorization(req, res)

}

function listener(req, res) {
    var path = req.url.replace(/%20/g, " ")
    console.log("[" + new Date() + "] " + req.method + " -> " + req.socket.remoteAddress + ":" + req.socket.remotePort + " : " + path)
    
    // functions
    let fct = functionMap[path.split("/")[1]]
    if (fct != undefined)  {
        return fct(req, res)
    }

    // get files
    if (path == "/" || path[1]=="?") {
        path = "/index.html";
    }
    if (path == "/favicon.ico") {
        path = "/assets/favicon.ico"
    }
    if (path.startsWith("/data")) {
        path = "/server" + path
    } else {
        path = "/server/website" + path
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

function postListener(req, res) {
    function checkAuthorization(req, res) {
        fs.readFile("./server/data/user.json")
        .then(contents => {
            if (JSON.parse(contents).find(v => v.key == req.get("Authorization")).rol != "maker") {
                throw new Error("not autorized")
            }
            listener(req, res)
        })
        .catch(err => {
            res.writeHead(401);
            res.end("not authorized");
            console.log("not authorized")
        })
    }
    var path = req.url.replace(/%20/g, " ")
    console.log("[" + new Date() + "] " + req.method + " -> " + req.socket.remoteAddress + ":" + req.socket.remotePort + " : " + path)
    // public
    if (req.url.endsWith("send_eliminatie")) {
        let post = req.body
        pushFile("./server/data/eliminatie/"+post.eliminatie+"/"+post.deelnemer+"_"+new Date().getTime()+".json", JSON.stringify(post), res)
        return
    }
    
    function listener(req, res) {
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

    // protected
    checkAuthorization(req, res)

}

/*** API ***/

function allEliminatie(req, res) {
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

function eliminatieResults(req, res) {
    let file = req.url.substr("/eliminatie_results".length)
    fs.readdir("./server/data/eliminatie/"+file).then(dir => {
        return Promise.all(dir.filter(v => v != "vragen.json").map(v => fs.readFile("./server/data/eliminatie/"+file+"/"+v)))
    }).then(responses => {
        let message = responses.map(v => JSON.parse(v))
        res.writeHead(200);
        res.end(JSON.stringify(message));
    })
}

function eliminatieVragen(req, res) {
    let filename = req.url.split("/").pop()
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

function eliminatieVragenFiltered(req, res) {
    let path = "/server/data/eliminatie/" + req.url.split("/").pop()
    fs.readFile("./server/data/eliminatie/" + req.url.split("/").pop() + "/vragen.json").then(content => {
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

/*** rest ***/

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

function changePassword(req, res) {
    let login = JSON.parse(req.get("login"))
    fs.readFile("./server/data/user.json")
        .then(content => {
            let users = JSON.parse(content)
            let user = users.find((item, index, arr) => item.naam == login.name && item.wachtwoord == login.oud_ww)
            if (user) {
                user.wachtwoord = login.nieuw_ww;
                return fs.writeFile("./server/data/user.json", JSON.stringify(users))
            } else {
                throw new Error("incorrect password or name.")
            }
        }).then(response => {
            res.writeHead(200);
            res.end("");
        })
        .catch(err => {
            res.writeHead(401);
            res.end(err.toString());
        })
}
 
/*** HELP FUNCTIONS ***/

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
