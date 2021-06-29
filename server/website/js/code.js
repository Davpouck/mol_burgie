"use strict"

// let deelnemers = JSON.parse(sessionStorage.getItem("deelnemers"))
// if (deelnemers == undefined) {
//     alert("niet correct geconfigureerd")
//     window.location.href = "./eliminatie_scherm_config.html"
// }

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
        if (obj.innerHTML.length > 0) {
            obj.innerHTML = obj.innerHTML.slice(0, -1);
        }
    }
    if (event.key == "Enter") {
        if (output.hidden == true) {
            checkInput(obj.innerHTML, obj);
            obj.innerHTML = "";
        }
        else {
            obj.innerHTML = "";
            text.hidden = false;
            output.hidden = true;
        }
    }
    if ("azertyuiopqsdfghjklmwxcvbn".indexOf(event.key) != -1) {
        obj.innerHTML += event.key;
    }
}

function checkInput(input, obj) {
    input = input.toLowerCase();
    fetch('/check_code', {
        headers: {
          'Content-Type': 'application/json',
          'code': input
        }
    }).then(response => {
        if (response.ok) {
            return response.json()
        }
    }).then(json => {
        if (json.value != undefined) {
            text.hidden = true;
            output.innerHTML = json.value;
            output.hidden = false;
        }
    }).catch(err => {
        alert(err)
    })    
}

function resizeImage(img) {
    img.style.height = document.documentElement.clientHeight + "px";
    img.style.width = document.documentElement.clientWidth + "px";
}

let text = document.getElementById("text");
let input = document.getElementById("input");
let output = document.getElementById("output");

let blink = setInterval(() => blinkUnderscore(input), 800);

document.addEventListener('keydown', (event) => addLetter(event, input));




