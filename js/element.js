function el_display(bool) { return bool ? "" : "none" }
function el_classes(data) { return Object.keys(data).filter(x => data[x]).join(" ") }

function updateHTML() {
    updateTabs()

    updateProgressBar(player.total_power, PLANETS.power(player.planets), `${format(player.total_power)} FE / ${format(PLANETS.power(player.planets))} FE`)

    el(`power-amount`).innerHTML = `You have <glow>${format(player.power)} FE</glow> ${formatGain(player.power, CURRENCIES.power.gain)} of nuclear power`

    el(`rp-button`).innerHTML = player.start ? `Refine your power for a <b>x${format(rp_formula())}</b> boost<br>Currently: <b>x${format(player.power_mult)}</b>` : `Start generating nuclear power`

    el(`planet-amount`).innerHTML = `You have blown up <b>${format(player.planets, 0)}</b> planet${player.planets.eq(1) ? '' : 's'}`

    updateGeneratorHTML()

    updateTopCurrenciesHTML()

    updateNSUpgs()

    updateNeutronicGeneratorHTML()

    el('auto-generator').style.display = el_display(hasNSUpg(11))

    el('auto-generator').innerHTML = `Automatically buy all normal generators: ${player.auto["generators"] ? "on" : "off"}`

    el('toggle').innerHTML = `Neutron star confirmation: ${player.options.confirm["neutron_star"] ? "on" : "off"}`
}


function setupHTML() {
    setupTabs()

    setupGeneratorHTML()

    setupTopCurrenciesHTML()

    setupNSUpgs()

    setupNeutronicGeneratorHTML()
}

function setupTopCurrenciesHTML() {
    let h = ""

    for (let [i,x] of Object.entries(TOP_CURR)) {
        h += `
        <div class="curr-top" id="curr-top-${i}-div">
            <div id="curr-top-${i}-amt1"><span id="curr-top-${i}-amt2">???</span> ${CURRENCIES[x.curr].costName}</div><button onclick="doReset('${x.reset ?? x.curr}')" id="curr-top-${i}-btn">Reset</button>
        </div>
        `
    }

    el('currs-top').innerHTML = h
}
function updateTopCurrenciesHTML() {
    for (let [i,x] of Object.entries(TOP_CURR)) {
        i = parseInt(i)

        var unl = !x.unl || x.unl()
        el(`curr-top-${i}-div`).style.display = el_display(unl)

        if (!unl) continue

        var c = CURRENCIES[x.curr]
        el(`curr-top-${i}-amt2`).textContent = c.amount.format(0) + ((c.passive??1)>0?" "+c.amount.formatGain(CURRENCIES[x.curr].gain.mul(c.passive)):"")

        let req = !x.req || x.req()
        el(`curr-top-${i}-btn`).innerHTML = req ? TOP_CURR[i].gain_text(c.gain) : TOP_CURR[i].req_text(c.req)
        el(`curr-top-${i}-btn`).className = el_classes({locked: !req})
    }
}