let files = {}
let active = 0
let deelnemers = {}
let codes = []
localStorage.clear()

function getVragenlijsten() {
    fetch("./data/eliminatie/config.json", {
        headers: {
          'Authorization': sessionStorage.getItem("key")
        },
      })
    .then((response) => {
        if (response.ok) {
            return response.json()
        } else {
            alert(response.statusText)
            return;
        }
    }).then((obj) => {
        active = obj.active;
        deelnemers = obj.deelnemers
        return fetch("./protected&all_eliminatie", {
            headers: {
              'Authorization': sessionStorage.getItem("key")
            },
          })
    }).then((response) => {
        if (response.ok) {
            return response.json()
        } else return;
    }).then((obj) => {
        files = obj;
        return fetch("./data/code.json", {
            headers: {
              'Authorization': sessionStorage.getItem("key")
            },
          })
    }).then((response) => {
        if (response.ok) {
            return response.json()
        } else return;
    }).then(json => {
        codes = json
        Toon()
    })
}

function Toon() {
    fileHTML = function(file) {
        html = "<div class='horz-bar'>"
        html += "<span><input type='radio' name='active-eliminatie' value='"+file+"'></input></span>"
        html += "<span>"+file+"</span><span>"+files[file]+"</span>"
        html += "<span>"
        if (files[file] > 0) {
            html += `<button onclick='view("${file}")'>view</button>`
            html += `<button onclick='viewResults("${file}")'>view results</button>`
        } else {
            html += `<button onclick='view("${file}")'>view/edit</button>`
        }
        html += `<button onclick='delVragen("${file}")'>del</button>`
        html += `<button><a href="/data/eliminatie/${file}/vragen.json" download>download</a></button>`
        html += "</span>"
        html += "</div>"
        return html
    }
    deelnemersHTML = function() {
        html = "<div style='padding-top:40px;'>"
        html += "<div class='horz-bar'>"
        html += "<span><b>deelnemer</b></span><span><b>jokers</b></span><span><b>pasvragen</b></span>"
        html += "</div>"
        for (let deelnemer of Object.keys(deelnemers)) {
            html += "<div class='horz-bar'>"
            html += `<span>${deelnemer}</span><span><button onclick="decJoker('${deelnemer}')">-</button>${deelnemers[deelnemer].joker}<button onclick="incJoker('${deelnemer}')">+</button></span><span><button onclick="decPasvraag('${deelnemer}')">-</button>${deelnemers[deelnemer].pasvraag}<button onclick="incPasvraag('${deelnemer}')">+</button></span>`
            html += "</div>"
        }
        html += "</div>"
        return html
    }

    function codesHTML() {
        html = "<div style='padding-top:40px;'> Code spel"
        html += "<div><button onclick='addCode()'>+</button><button onclick='popCode()'>-</button><button onclick='saveCode()'>save</button></div>"
        html += "<div><input disabled value='input'></input><input disabled value='output'></input></div>"
        codes.forEach(v => html += `<div><input class='code-c' value='${v.code}'></input><input class='code-v' value='${v.value}'></input></div>`)
        return html
    }

    html = `<button onclick="newVragen()">nieuwe vragenlijst</button>
        <div class="horz-bar">
            <span><b>actief</b></span>
            <span><b>naam</b></span>
            <span><b>aantal indieningen</b></span>
            <span><b>acties</b></span>
        </div>`
        $("body").html(html)
    for (let file of Object.keys(files)) {
        $("body").append(fileHTML(file))
    }
    $("input[type='radio']").on("change", () => newActive())
    $("input[type='radio']").filter("[value="+active+"]").prop("checked", true)
    $("body").append(deelnemersHTML())
    $("body").append(codesHTML())
    $(".code-c").on("change", () => updateCodes())
    $(".code-v").on("change", () => updateCodes())

}

function newVragen() {
    let naam = prompt("geef naam voor eliminatie_vragen")
    if (naam == undefined) return
    sendNewServer(naam, () => {goToView(naam);getVragenlijsten();})
}

function view(file) {
    localStorage.setItem("edit", files[file] <= 0)
    goToView(file)
}

function delVragen(file) {
    if (files[file] > 0) {
        if (!confirm("Zeker? Ook de indieningen zullen verwijderd worden.")) return
    }
    fetch('./del_eliminatie_folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem("key")
        },
        body: JSON.stringify({filename: file})
      }).then(re => {
          if (re.ok) {
              if ($("input[name='active-eliminatie']").filter(":checked").val() == file) active = undefined
            getVragenlijsten()
            configToServer()
          } else {
              throw new Error(re.status)
          }
      }).catch(err => {
          alert("kon niet verwijderen: "+err)
      })
}

function goToView(file) {
    localStorage.setItem("filename", file)
    window.location.href = "./input_vragen.html"
}

function CodesToServer() {
    fetch('./data/code.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem("key")
        },
        body: JSON.stringify(codes)
      }).then(response => {
          getVragenlijsten()
      }).catch(err => {
          alert(err)
      })
}

function addCode() {
    codes.push({
        code: "default code",
        value: "default value"
    })
    CodesToServer()
} 

function popCode() {
    codes.pop()
    CodesToServer()
}

function saveCode() {
    CodesToServer()
}

function updateCodes() {
    codes = []
    $(".code-c").each((i,e) => codes.push({code: e.value}))
    $(".code-v").each((i,e) => codes[i].value = e.value)
    CodesToServer()
}

function sendNewServer(filename, after) {
    let content = {
        naam: filename,
        data: [{
            vraag: "Dit is een voorbeeldvraag",
            type: "meerkeuze",
            opties: ["optie1", "optie2"],
            correct: 0
        }]
    }
    fetch('./new_input_vragen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem("key")
        },
        body: JSON.stringify(content)
      }).then(re => {
          if (re.ok) {
              //alert("vragen correct opgeslagen")
              after.call(this)
          } else {
              throw new Error(re.status)
          }
      }).catch(err => {
          alert("niet gelukt, probeer opnieuw me een ander naam ["+err+"]")
      })
}

function newActive() {
    active = $("input[name='active-eliminatie']").filter(":checked").val()
    configToServer()
}

function incPasvraag(deelnemer) {
    deelnemers[deelnemer].pasvraag++
    new Promise(resolve => resolve(configToServer()))
    .then(getVragenlijsten())
}
function decPasvraag(deelnemer) {
    if (deelnemers[deelnemer].pasvraag <= 0) return
    deelnemers[deelnemer].pasvraag--
    new Promise(resolve => resolve(configToServer()))
    .then(getVragenlijsten())
}
function incJoker(deelnemer) {
    deelnemers[deelnemer].joker++
    new Promise(resolve => resolve(configToServer()))
    .then(getVragenlijsten())
}
function decJoker(deelnemer) {
    if (deelnemers[deelnemer].joker <= 0) return
    deelnemers[deelnemer].joker--
    new Promise(resolve => resolve(configToServer()))
    .then(getVragenlijsten())
}

function configToServer() {
    let message = {
        active: active,
        deelnemers: deelnemers
    }
    fetch('./update_config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': sessionStorage.getItem("key")
        },
        body: JSON.stringify(message)
      }).then(re => {
          if (re.ok) {
            getVragenlijsten()
          } else {
              throw new Error(re.status)
          }
      }).catch(err => {
          alert("server niet up to date")
      })
}

function viewResults(file) {
    localStorage.setItem("file_results", file)
    window.location.href = "./view_results.html"
}

getVragenlijsten()

// auto reload
window.addEventListener( "pageshow", function ( event ) {
    var historyTraversal = event.persisted || 
                           ( typeof window.performance != "undefined" && 
                                window.performance.navigation.type === 2 );
    if ( historyTraversal ) {
      window.location.reload();
    }
  });