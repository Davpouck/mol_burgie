"use strict"

let deelnemers = JSON.parse(sessionStorage.getItem("deelnemers"))
if (deelnemers == undefined) {
    alert("niet correct geconfigureerd")
    window.location.href = "./eliminatie_scherm_config.html"
}

function blinkUnderscore(obj) {
    let content = obj.innerHTML;
    if (content.endsWith("_")) {
        obj.innerHTML = content.slice(0, -1);
    }
    else {
        obj.innerHTML = content + '_';
    }
}

function addLetter(event, obj) {
    let content = obj.innerHTML;
    if (content.endsWith("_")) {
        obj.innerHTML = content.slice(0, -1);
    }
    if (event.key == "Backspace") {
        if (obj.innerHTML.length > 5) {
            obj.innerHTML = obj.innerHTML.slice(0, -1);
        }
    }
    if (event.key == "Enter") {
        document.getElementById("outro").pause()
        if (document.getElementById("scherm") == null) {
            checkName(obj.innerHTML.slice(5), obj);
        }
        else {
            obj.innerHTML = "Naam:";
            obj.hidden = false;
            document.getElementById("scherm").remove();
        }
    }
    if (event.key == "1") {
        document.getElementById("intro").play();
    }
    if ("azertyuiopqsdfghjklmwxcvbn".indexOf(event.key) != -1) {
        obj.innerHTML += event.key;
        document.getElementById("spanning").play();       
    }
}

function checkName(name, obj) {
    name = name.toLowerCase();
    if (deelnemers[name] == "groen" || deelnemers[name] == "rood") {
        let scherm = document.createElement("img");
        scherm.id = "scherm";
        resizeImage(scherm);
        obj.hidden = true;
        scherm.src = "assets/image/" + deelnemers[name] + "_scherm.png";
        scherm.style.opacity = "0";
        document.body.append(scherm);
        setTimeout(() => {scherm.style.opacity = "1";
            if (deelnemers[name] == "rood") {
                document.getElementById("spanning").pause();
                document.getElementById("rood").play();
                setTimeout(() => document.getElementById("outro").play(), 5000)
            }
        }, 800);
    }
    
}

function resizeImage(img) {
    img.style.height = document.documentElement.clientHeight + "px";
    img.style.width = document.documentElement.clientWidth + "px";
}

let text = document.getElementById("text");

let blink = setInterval(() => blinkUnderscore(text), 800);

document.addEventListener('keydown', (event) => addLetter(event, text));




