class objectProperty {
    
    listeners = []
    constructor(obj) {
        // invokes the setter
        this.obj = obj;
    }
    
    get obj() {
        return this._obj;
    }
    
    set obj(value) {
        // if (value != this._obj) {
            //     this.listeners.forEach((item) => {
                //         item.call(window, this._obj, value)
                //     })
                // }
                this._obj = value;
            }
            
            push = function(item) {
                this._obj.push(item);
                this.listeners.forEach((item) => {
                    item.call(window)
                })
            }
            
            pop = function() {
                this._obj.pop();
                this.listeners.forEach((item) => {
                    item.call(window)
                })
            }
            
            wissel= function(i, j) {
                let temp = this._obj[i]
                this._obj[i] = this._obj[j]
                this._obj[j] = temp
                this.listeners.forEach((item) => {
                    item.call(window)
                })
            }
            
            addOptie = function(i) {
                if (this._obj[i].opties.length < 10) this._obj[i].opties.push("voorbeeld optie")
                this.listeners.forEach((item) => {
                    item.call(window)
                })
            }
            
            popOptie = function(i) {
                if (this._obj[i].opties.length > 0) this._obj[i].opties.pop()
                this.listeners.forEach((item) => {
                    item.call(window)
                })
            }

            changeType = function(i) {
                this._obj[i].type = this._obj[i].type == "top" ? "meerkeuze" : "top"
                this.listeners.forEach((item) => {
                    item.call(window)
                })
            }
            
            addListener = function(fn) {
                this.listeners.push(fn)
            }
            
            removeListener = function(fn) {
                this.listeners = this.listeners.filter(
                    function(item) {
                        if (item !== fn) {
                            return item;
                        }
                    }
                    );
                }
                
                getProperty = function() {
                    return this
                }
                
            }
            
            
function Toon() {
    let html = '<button onclick="addVraag()">voeg vraag toe</button>'
    html += '<button onclick="popVraag()">verwijder laatste vraag</button>'
    html += '<button onclick="save()">sla op</button>'
    html += '<button onclick="back()">sla op + terug naar overzicht</button>'
    html += ' filename: '+filename
    for (let i=0; i < vragen.obj.length; i++) {
        html += toonVraag(vragen.obj[i], i);
    }
    document.body.innerHTML = html
    for (let i=0; i < vragen.obj.length; i++) {
        document.getElementsByClassName("vraag")[i].querySelector(".opties input[value='"+vragen.obj[i].correct+"']").checked=true;
    }

    if (localStorage.getItem("edit") == "false") {
        $("input, textarea, button").prop('disabled', true);
    }

    Array.from(document.querySelectorAll("input, textarea")).forEach((item, index, arr) => {item.addEventListener("input", (e) => inputData())})
}

function toonVraag(vraag, i) {
    let html = "<div class='vraag'>"
    if (i > 0) html += "<button onclick='wisselVraag("+i+","+(i-1)+")'>&uarr;</button>"
    if (i < vragen.obj.length-1) html += "<button onclick='wisselVraag("+i+","+(i+1)+")'>&darr;</button>"
    html += "<button onclick='changeType("+i+")'>verander type</button>"
    html += "<button onclick='addOptie("+i+")'>+ optie</button>"
    html += "<button onclick='popOptie("+i+")'>- optie</button>"
    html += "<div>"
    html += "<label>["+vraag.type+"] vraag "+(i+1)+":</label><br>"
    html += "<textarea>"+vraag.vraag+"</textarea>"
    
    html += "<div class='opties'>"
    for (let j=0;j<vraag.opties.length; j++) {
        html += "<div>"
        html += "<input type='radio' name='vraag"+i+"' value='"+j+"'>"
        html += "<input class='optie' value='"+vraag.opties[j]+"'></input>"
        html += "</div>"
    }
    html += "</div>"
    
    html += "</div>"
    
    html += "</div>"
    return html;
    
}

function addVraag() {
    vragen.push({
        vraag: "Dit is een voorbeeldvraag",
        type: "meerkeuze",
        opties: ["optie1", "optie2"],
        correct: 0
    })
}

function popVraag() {
    vragen.pop();
}

function wisselVraag(i,j) {
    vragen.wissel(i,j)
}

function addOptie(i) {
    vragen.addOptie(i)
}
function popOptie(i) {
    vragen.popOptie(i)
}

function changeType(i) {
    vragen.changeType(i)
}


function init() {
    filename = localStorage.getItem("filename")
    fetch("./get_intput_vragen?"+filename)
    .then(response => {
        if (response.ok) {
            return response.json()
        } else {
            alert("file not found")
            window.location.href = "./eliminatie_config.html"
        }
    }).then((obj)=> {
        vragen = new objectProperty(obj)
        vragen.addListener((oud, nieuw) => Toon())
        Toon()
    })
}

function inputData() {
    let input_vragen = document.getElementsByClassName("vraag")
    let n_vragen = vragen.obj
    for (let i=0; i<input_vragen.length; i++) {
        n_vragen[i].vraag = input_vragen[i].getElementsByTagName("textarea")[0].value
        n_vragen[i].opties = Array.from(input_vragen[i].querySelectorAll(".opties input.optie")).map((item, index, arr) => item.value)
        n_vragen[i].correct = Array.from(input_vragen[i].querySelectorAll(".opties input[type='radio']")).find((v,i,a)=>v.checked).value
    }
    vragen.obj = n_vragen   
}
function back() {
    let name = filename
    let content = {
        naam: name,
        data: vragen.obj
    }
    fetch('./save_input_vragen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      }).then(re => {
          if (re.ok) {
              alert("vragen correct opgeslagen")
              window.location.href = "./eliminatie_config.html"
          } else {
              throw new Error(re.status)
          }
      }).catch(err => {
          alert("niet goed opgeslagen: "+err)
      })
}

function save() {
    let name = filename
    let content = {
        naam: name,
        data: vragen.obj
    }
    fetch('./save_input_vragen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      }).then(re => {
          if (re.ok) {
              alert("vragen correct opgeslagen")
          } else {
              throw new Error(re.status)
          }
      }).catch(err => {
          alert("niet goed opgeslagen: "+err)
      })
}

let vragen, filename
init()