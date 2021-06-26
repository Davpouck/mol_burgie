let eliminatie = undefined
let antwoorden = undefined
let vragen = undefined
init()

function check(deelnemer, i) {
    if (vragen[i].type != "top") {
        if (deelnemer.antwoorden[i] == "joker") return 1
        return 0+(deelnemer.antwoorden[i] == vragen[i].correct)
    } else {
        return 5 - ((deelnemer.antwoorden[i].findIndex(v => vragen[i].correct == v) != -1) ? deelnemer.antwoorden[i].findIndex(v => vragen[i].correct == v) : 5)
    }
}

function totaleScore(deelnemer) {
    let score = 0
    let fouten = 0
    for (let i=0;i<vragen.length;i++) {
        let re = check(deelnemer, i)
        if (vragen[i].type != "top" && re == 0) fouten++
        score += re
    }
    return score + Math.min(fouten, deelnemer.pasvragen)
}

function ToonResults() {
    let html = "<table>"
    html += "<tr><th>deelnemer</th><th>pt</th><th>tijd</th><th>pasvragen</th>"
    for (let i=0; i<vragen.length;i++) {
        html += "<th>"+i+"</th>"
    }
    for (let deelnemer of antwoorden) {
        html += "<tr>"
        html += "<td>"+deelnemer.deelnemer+"</td>"
        html += "<td>"+totaleScore(deelnemer)+"</td>"
        html += "<td>"+deelnemer.minuten+":"+deelnemer.seconden+"</td>"
        html += "<td>"+deelnemer.pasvragen+"</td>"
        for (let i=0;i<vragen.length;i++) {
            html += "<td>"+check(deelnemer, i)+"</td>"
        }
        html += "</tr>"
    }
    html += "</tr>"
    html += "</table>"
    $("body").html(html)
}

function init() {
    eliminatie = localStorage.getItem("file_results")
    if (eliminatie == undefined) window.location.href = "./eliminatie_config.html"
    fetch("/data/eliminatie/"+eliminatie+"/vragen.json").then(response => {
        return response.json();
    }).then(json => {
        vragen = json
        return fetch("/get_results?"+eliminatie)
    }).then(response => {
        return response.json()
    }).then(json => {
        antwoorden = json
        ToonResults()
    }).catch(err => {
        console.log(err)
    })
}