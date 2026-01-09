var tab = 0, stab = [0,0,0,0,0], tab_name = 'main'

function update_something() {

}

const TAB_IDS = {
    'main': {
        name: "Main",
        html: update_something,

        notify() {
            return false
        },
    },
    'options': {
        name: "Options",
        html: update_something,

        notify() {
            return false
        },
    },
    'neutron-star-upgrades': {
        name: "Upgrades",
        html: update_something
    },
    'neutronic-generators': {
        name: "Neutronic Generators",
        html: update_something
    }
}

const TABS = [
    { // 0
        name: "Main",
        unl: ()=>true,
        stab: "main"
    },
    { // 0
        name: "Options",
        unl: ()=>true,
        stab: "options"
    },
    { // 0
        name: "Neutron Star",
        unl: ()=>player.neutron_star.times > 0,
        stab: [
            ["neutron-star-upgrades"],
            ['neutronic-generators', ()=>hasNSUpg(11)]
        ]
    },
]

const DEFAULT_TAB_STYLE = {
    "background": "1e1e1e",
    "backgroundSize": 'initial',
    "color": "black",
    "animation": "none",
}

function switchTab(t,st) {
    tab = t
    if (st !== undefined) stab[t] = st

    let s = TABS[t].stab

    if (Array.isArray(s)) tab_name = s[stab[t]??0][0]
    else tab_name = s
}

function getTabNotification(id) {
    //return TAB_IDS[id].notify?.() || id in SU_TABS && SU_TABS[id].filter(x => !tmp.su_automated.includes(x) && canAffordSharkUpgrade(x)).length > 0
}

function updateTabs() {
    var tab_unlocked = {}

    for (let [i,v] of Object.entries(TABS)) {
        let unl = !v.unl || v.unl(), elem, selected = parseInt(i) == tab, array = Array.isArray(v.stab)
        tab_unlocked[i] = []

        if (array) {
            if (unl) {
                tab_unlocked[i] = v.stab.filter(x => (!x[1] || x[1]()) && getTabNotification(x[0])).map(x => x[0])
            }

            elem = el('stab'+i+'-div')

            elem.style.display = el_display(selected)

            if (selected) v.stab.forEach(([x,u],j) => {
                var s_elem = el('stab'+i+'-'+j+'-button')

                s_elem.style.display = el_display(!u || u())
                s_elem.className = el_classes({"tab-button": true, stab: true, selected: x == tab_name, notify: tab_unlocked[i].includes(x)}) // "tab-button stab"+(x == tab_name ? " selected" : "")
            })
        }

        elem = el('tab'+i+'-button')

        elem.style.display = el_display(unl)
        if (unl) elem.className = el_classes({"tab-button": true, selected, notify: false}) // "tab-button"+(selected ? " selected" : "")
    }

    for (let [i,v] of Object.entries(TAB_IDS)) {
        let unl = tab_name == i, elem = el(i+"-tab")

        if (!elem) continue;

        elem.style.display = el_display(unl)

        if (unl) v.html?.()
    }

   

    let s = TABS[tab]?.style ?? {}
    for (let [k,v] of Object.entries(DEFAULT_TAB_STYLE)) document.body.style[k] = s[k] ?? v
}

function setupTabs() {
    // Setting Tab as Language

    for (let [i,v] of Object.entries(TAB_IDS)) v.name = v.name
    TABS.forEach(v => { if (!Array.isArray(v.stab)) v.name = TAB_IDS[v.stab].name; else v.name = v.name })

    // Setup HTML

    let h = "", h2 = ""

    for (let [i,v] of Object.entries(TABS)) {
        h += `<button class="tab-button" id="tab${i}-button" onclick="switchTab(${i})">${v.name}</button>`

        if (Array.isArray(v.stab)) {
            h2 += `<div id="stab${i}-div" id="${v.stab[stab[i]]}-tab">
            ${v.stab.map(([x],j) => `<button class="tab-button stab" id="stab${i}-${j}-button" onclick="switchTab(${i},${j})">${TAB_IDS[x].name}</button>`).join("")}
            </div>`
        }
    }

    el('tabs').innerHTML = h + h2
}