let files = {}
let active = 0
let deelnemers = {}
localStorage.clear()

function getVragenlijsten() {
    fetch("./data/eliminatie/config.json")
    .then((response) => {
        if (response.ok) {
            return response.json()
        } else return;
    }).then((obj) => {
        active = obj.active;
        deelnemers = obj.deelnemers
        return fetch("./get_eliminatie")
    }).then((response) => {
        if (response.ok) {
            return response.json()
        } else return;
    }).then((obj) => {
        files = obj;
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
          'Content-Type': 'application/json'
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
          'Content-Type': 'application/json'
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      }).then(re => {
          if (re.ok) {
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