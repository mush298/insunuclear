const VERSION = 3
const SAVE_ID = "insunuclear_save"
var prevSave = "", autosave

function getPlayerData() {
    let s = {
        power: E(0),
        total_power: E(0),

        power_mult: E(1),

        generator_power: E(0),
        total_generator_power: E(0),

        planets: E(0),

        start: false,

        generators: [
            //[amount, bought amount]
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)]
        ],

        neutron_star: {
          amount: E(0),
          total: E(0),
          times: 0,

          upgrades: [],

          neutronic_power: E(0),
          total_neutronic_power: E(0),
          generators: [
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)],
            [E(0), E(0)]
        ],

        neutronic_energy: E(0)
        },

        options: {
            notation: "mixed_sc",

            confirm: {
                neutron_star: true
            }
        },

        radios: {
            notify: false
        },

        auto: {
            generators: false
        },

        latest_time: Date.now(),

        VERSION: VERSION,
        timePlayed: 0,
        totalTimePlayed: 0,
    }

    return s
}

function wipe(reload,start) {
	player = getPlayerData()
    if (start) return
    setupOptions()
    reloadTemp()
    tab = 0, stab = stab.map(x=>0), tab_name = 'main'
    ores_grid = []
	if (reload) {
        save()
        location.reload()
    }
}

function loadPlayer(load) {
    const DATA = getPlayerData()
    player = deepNaN(load, DATA)
    player = deepUndefinedAndDecimal(player, DATA)

    checkVersion()
}

function checkVersion() {

    player.VERSION = Math.max(player.VERSION, VERSION)
}

function clonePlayer(obj,data) {
    let unique = {}

    for (let k in obj) {
        if (data[k] == null || data[k] == undefined) continue
        unique[k] = Object.getPrototypeOf(data[k]).constructor.name == "Decimal"
        ? E(obj[k])
        : typeof obj[k] == 'object'
        ? clonePlayer(obj[k],data[k])
        : obj[k]
    }

    return unique
}

function deepNaN(obj, data) {
    for (let k in obj) {
        if (typeof obj[k] == 'string') {
            if (data[k] == null || data[k] == undefined ? false : Object.getPrototypeOf(data[k]).constructor.name == "Decimal") if (isNaN(E(obj[k]).mag)) obj[k] = data[k]
        } else {
            if (typeof obj[k] != 'object' && isNaN(obj[k])) obj[k] = data[k]
            if (typeof obj[k] == 'object' && data[k] && obj[k] != null) obj[k] = deepNaN(obj[k], data[k])
        }
    }
    return obj
}

function deepUndefinedAndDecimal(obj, data) {
    if (obj == null) return data
    for (let k in data) {
        if (obj[k] === null) continue
        if (obj[k] === undefined) obj[k] = data[k]
        else {
            if (Object.getPrototypeOf(data[k]).constructor.name == "Decimal") obj[k] = E(obj[k])
            else if (typeof obj[k] == 'object') deepUndefinedAndDecimal(obj[k], data[k])
        }
    }
    return obj
}

function preventSaving() { return false }

function save(auto=false) {
    if (auto && !player.radios.autosave) return
    let str = btoa(JSON.stringify(player))
    if (preventSaving() || findNaN(str, true)) return
    if (localStorage.getItem(SAVE_ID) == '') wipe()
    localStorage.setItem(SAVE_ID,str)
    prevSave = str
}

function save_again(str) {
localStorage.setItem(SAVE_ID,str)
}

function load(x){
    if(typeof x == "string" && x != ''){
        loadPlayer(JSON.parse(atob(x)))
    } else {
        wipe(false,true)
    }
}

function exporty() {
    let str = btoa(JSON.stringify(player))
    save();
    let file = new Blob([str], {type: "text/plain"})
    window.URL = window.URL || window.webkitURL;
    let a = document.createElement("a")
    a.href = window.URL.createObjectURL(file)
    a.download = "Insunuclear - "+new Date().toGMTString()+".txt"
    a.click()
}

function copyToClipboard(text) {
    let copyText = document.getElementById('copy')
    copyText.value = text
    copyText.style.visibility = "visible"
    copyText.select();
    document.execCommand("copy");
    copyText.style.visibility = "hidden"
}

function export_copy() {
    copyToClipboard(btoa(JSON.stringify(player)))
}

function importy() {
    const loadgame = prompt("Import your save here!");
    if (loadgame === null) return;

    console.log(atob(loadgame))

    const keep = player;

    try {
        if (findNaN(loadgame, true)) {
            error("Error importing: save contains NaN");
            return;
        }

        localStorage.setItem(SAVE_ID, loadgame);
        save_again(loadgame)
        location.reload();
    } catch (e) {
        error("Error importing");
        player = keep;
    }
}


function importy_file() {
    let a = document.createElement("input")
    a.setAttribute("type","file")
    a.click()
    a.onchange = ()=>{
        let fr = new FileReader();
        fr.onload = () => {
            let loadgame = fr.result
            if (findNaN(loadgame, true)) {
				error("Error Importing, because it got NaNed")
				return
			}
            localStorage.setItem(SAVE_ID, loadgame)
			location.reload()
        }
        fr.readAsText(a.files[0]);
    }
}

function wipeConfirm() {
    const p = prompt("are you sure you want to wipe? thpe yes if you wanna do");
    if (p && p.toLowerCase() === "yes") wipe();
}


function checkNaN() {
    let naned = findNaN(player)
    if (naned) {
        warn("Game Data got NaNed because of "+naned.bold())
        resetTemp()
        loadGame(false, true)
        tmp.start = 1
        tmp.pass = 1
    }
}

function isNaNed(val) {
    return typeof val == "number" ? isNaN(val) : Object.getPrototypeOf(val).constructor.name == "Decimal" ? isNaN(val.mag) : false
}

function findNaN(obj, str=false, data=getPlayerData(), node='player') {
    if (str ? typeof obj == "string" : false) obj = JSON.parse(atob(obj))
    for (let k in obj) {
        if (typeof obj[k] == "number") if (isNaNed(obj[k])) return node+'.'+k
        if (str) {
            if (typeof obj[k] == "string") if (data[k] == null || data[k] == undefined ? false : Object.getPrototypeOf(data[k]).constructor.name == "Decimal") if (isNaN(E(obj[k]).mag)) return node+'.'+k
        } else {
            if (obj[k] == null || obj[k] == undefined ? false : Object.getPrototypeOf(obj[k]).constructor.name == "Decimal") if (isNaN(E(obj[k]).mag)) return node+'.'+k
        }
        if (typeof obj[k] == "object") {
            let node2 = findNaN(obj[k], str, data[k], (node?node+'.':'')+k)
            if (node2) return node2
        }
    }
    return false
}