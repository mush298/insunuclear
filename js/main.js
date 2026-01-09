const el = id => document.getElementById(id);
const FPS = 30;

function toTextStyle(text, style = "", id) { return `<text-style text="${style}" ${id ? `id="${id}"` : ""}>${text}</text-style>` }
function toColoredText(text, color = "") { return Array.isArray(text) ? text.map(x => toColoredText(x, color)) : `<text-style style="color:${color}">${text}</text-style>` }
function compareStyle(text, x, y) { return Decimal.eq(x, y) ? toTextStyle(text) : Decimal.gte(x, y) ? toTextStyle(icon("up-arrow") + text, "green") : toTextStyle(icon("down-arrow") + text, "red") }

let options = {
    notation: "mixed_sc",
    max_range: 9
}

var player = {}, date = Date.now(), diff = 0, prevSave = "";

function loop() {

    diff = Date.now() - date;


    //updateOptions()
    updateHTML()
    //calc(diff/1000)
    updateTemp()

    if (player.start) gainCurrency('power', CURRENCIES.power.gain.div(FPS))

    gainCurrency('generator_power', CURRENCIES.generator_power.gain.div(FPS))
    gainCurrency('neutronic_power', CURRENCIES.neutronic_power.gain.div(FPS))


    if (player.total_power.gte(PLANETS.power(player.planets))) {
        if (!hasNSUpg(3)) {
        PLANETS.reset()
        } else {
        player.planets = player.planets.add(1)
        }
    }

    updateGENERATORS()

    updateNeutronicGenerators()

    if (hasNSUpg(14)) gainCurrency('neutron_star', CURRENCIES.neutron_star.gain.div(FPS))

    if (player.auto.generators) AUTOMATION.generators()

    options.notation = player.options.notation


    date = Date.now()
}

setInterval(loop, 1000 / FPS)
setInterval(save, 5000)


function loadGame() {
    prevSave = localStorage.getItem(SAVE_ID)
    player = getPlayerData()
    load(prevSave)

    setupHTML()
    setupTemp()
}



const TOP_CURR = [
    {
        unl: ()=> true, //player.planets.gte(10) || player.neutron_star.times > 0,
        curr: "neutron_star",
        req: ()=>player.total_power.gte(CURRENCIES.neutron_star.req),

        req_text: x => `Reach <b>${x.format(0)}</b> FE of nuclear power`,
        gain_text: x => `Reset for <b>${x.format(0)}</b> Neutron Stars`
    },
]

//main tab

tmp = {
    scalings: {},
}

function setupTemp() {
    for (let x in SCALINGS) {
        tmp.scalings[x] = []
        for (let y in SCALINGS[x].base) {
            let b = []
            for (let z of SCALINGS[x].base[y]) b.push(z)
            tmp.scalings[x].push(b)
        }
    }

}

function updateTemp() {
    for (let x in SCALINGS) {
        let t = tmp.scalings[x]

        let s = getScalingStarts(x), m = getScalingModes(x), p = getScalingPowers(x).map((q, i) => m[i] == "E2" ? Decimal.max(q, Math.E) : q), e = getScalingExclusions(x)

        for (let i = 0; i < SCALINGS[x].base.length; i++) t[i] = [s[i], p[i], m[i], e[i]];
    }
}


function updateProgressBar(amount, max, text = "") {
    const bar = document.querySelector(".progress-fill");
    const label = document.querySelector(".progress-text");

    let percent = amount.log10().div(max.log10()).times(100);
    percent = Decimal.min(Decimal.max(percent, 0), 100);

    bar.style.width = percent.toNumber() + "%";
    label.textContent = text;
}





//actual main tab

let REFINE_POWER = {
    get formula() {
        let x = player.total_power.log10().mul(player.planets.add(1))

        if (player.planets.gte(2)) x = x.mul(player.planets.pow_base(2))

        if (hasNSUpg(2)) x = x.pow(3)

    

        return x
    },

    reset() {
        if (!player.start) {
            player.start = true
        } else {
            player.power_mult = REFINE_POWER.formula
            if (!hasNSUpg(2)) {
            player.power = E(0)
            player.total_power = E(0)
            }
        }
    }
}

function rp_reset() {
    if (rp_formula().gt(1) || !player.start) REFINE_POWER.reset()
}

function rp_formula() {
    return REFINE_POWER.formula.div(player.power_mult).max(1)
}

let PLANETS = {
    power(p) {
        p = E(p)

        if (p.eq(0)) return E(250)

        let b = E(10)

        b = b.add(p.scaleAll("planets").pow(2))

        return b.pow10()
    },

    reset(force = false) {
        player.power = E(0)
        player.total_power = E(0)
        player.power_mult = E(1)
        player.generator_power = E(0)
        if (!force) player.planets = player.planets.add(1)

        player.generators = [
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
        ]
}
}

let GENERATORS = [
    {
        cost(x) {
            x = E(x)
            return E(100).pow(x.add(1))
        },

        get mult() {
            let x = player.generators[0][1].pow_base(2)

            let m = player.generators[0][0].log10().pow_base(1.5)

            if (player.generators[0][0].gte(1)) x = x.mul(m)

            if (player.planets.gte(3)) x = x.mul(player.planets.pow_base(2))
            
            if (hasNSUpg(1)) x = x.mul(NSUpgEffect(1))

            x = x.mul(CURRENCIES.neutronic_power.effect)

            return x
        },

        get unl() {
            return player.planets.gte(1)
        },

        name: 'Nuclear Generator'
    },
    {
        cost(x) {
            x = E(x)
            return E(10000).pow(x.add(1))
        },

        get mult() {
            let x = player.generators[1][1].pow_base(2)

            let m = player.generators[1][0].log10().pow_base(1.6)

            if (player.generators[1][0].gte(1)) x = x.mul(m)

            if (player.planets.gte(3)) x = x.mul(player.planets.pow_base(2))

            if (hasNSUpg(1)) x = x.mul(NSUpgEffect(1))

             x = x.mul(CURRENCIES.neutronic_power.effect)

            return x
        },

        get unl() {
            return player.generators[0][0].gte(1) || player.planets.gte(2)
        },

        name: 'Bi-Generator'
    },
    {
        cost(x) {
            x = E(x)
            return E(1e5).pow(x.add(1))
        },

        get mult() {
            let x = player.generators[2][1].pow_base(2)

            let m = player.generators[2][0].log10().pow_base(1.7)

            if (player.generators[2][0].gte(1)) x = x.mul(m)

            if (player.planets.gte(3)) x = x.mul(player.planets.pow_base(2))

            if (hasNSUpg(1)) x = x.mul(NSUpgEffect(1))

             x = x.mul(CURRENCIES.neutronic_power.effect)

            return x
        },

        get unl() {
            return player.generators[1][0].gte(1) || player.planets.gte(2)
        },

        name: 'Tri-Generator'
    },
    {
        cost(x) {
            x = E(x)
            return E(1e6).pow(x.add(1))
        },

        get mult() {
            let x = player.generators[3][1].pow_base(2)

            let m = player.generators[3][0].log10().pow_base(1.8)

            if (player.generators[3][0].gte(1)) x = x.mul(m)

            if (player.planets.gte(3)) x = x.mul(player.planets.pow_base(2))

            if (hasNSUpg(1)) x = x.mul(NSUpgEffect(1))

             x = x.mul(CURRENCIES.neutronic_power.effect)

            return x
        },

        get unl() {
            return player.generators[2][0].gte(1) || player.planets.gte(2)
        },

        name: 'Tetra-Generator'
    },
    {
        cost(x) {
            x = E(x)
            return E(1e7).pow(x.add(1))
        },

        get mult() {
            let x = player.generators[4][1].pow_base(2)

            let m = player.generators[4][0].log10().pow_base(1.8)

            if (player.generators[4][0].gte(1)) x = x.mul(m)

            if (player.planets.gte(3)) x = x.mul(player.planets.pow_base(2))
            
            if (hasNSUpg(1)) x = x.mul(NSUpgEffect(1))

             x = x.mul(CURRENCIES.neutronic_power.effect)

            return x
        },

        get unl() {
            return player.planets.gte(2)
        },

        name: 'Penta-Generator'
    },
    {
        cost(x) {
            x = E(x)
            return E(1e8).pow(x.add(1))
        },

        get mult() {
            let x = player.generators[5][1].pow_base(2)

            let m = player.generators[5][0].log10().pow_base(1.9)

            if (player.generators[5][0].gte(1)) x = x.mul(m)

            if (player.planets.gte(3)) x = x.mul(player.planets.pow_base(2))

            if (hasNSUpg(1)) x = x.mul(NSUpgEffect(1))
            
             x = x.mul(CURRENCIES.neutronic_power.effect)

            return x
        },

        get unl() {
            return player.planets.gte(3)
        },

        name: 'Hexa-Generator'
    },
    {
        cost(x) {
            x = E(x)
            return E(1e9).pow(x.add(1))
        },

        get mult() {
            let x = player.generators[6][1].pow_base(2)

            let m = player.generators[6][0].log10().pow_base(2)

            if (player.generators[6][0].gte(1)) x = x.mul(m)

            if (player.planets.gte(3)) x = x.mul(player.planets.pow_base(2))

            if (hasNSUpg(1)) x = x.mul(NSUpgEffect(1))

             x = x.mul(CURRENCIES.neutronic_power.effect)

            return x
        },

        get unl() {
            return player.planets.gte(4)
        },

        name: 'Hepta-Generator'
    },
    {
        cost(x) {
            x = E(x)
            return E(1e10).pow(x.add(1))
        },

        get mult() {
            let x = player.generators[7][1].pow_base(2)

            let m = player.generators[7][0].log10().pow_base(2)

            if (player.generators[7][0].gte(1)) x = x.mul(m)

            if (player.planets.gte(3)) x = x.mul(player.planets.pow_base(2))

            if (hasNSUpg(1)) x = x.mul(NSUpgEffect(1))

             x = x.mul(CURRENCIES.neutronic_power.effect)

            return x
        },

        get unl() {
            return player.planets.gte(4)
        },

        name: 'Octa-Generator'
    },
    {
        cost(x) {
            x = E(x)
            return E(1e11).pow(x.add(1))
        },

        get mult() {
            let x = player.generators[8][1].pow_base(2)

            let m = player.generators[8][0].log10().pow_base(2)

            if (player.generators[8][0].gte(1)) x = x.mul(m)

            if (player.planets.gte(3)) x = x.mul(player.planets.pow_base(2))

            if (hasNSUpg(1)) x = x.mul(NSUpgEffect(1))
            
             x = x.mul(CURRENCIES.neutronic_power.effect)

            return x
        },

        get unl() {
            return player.planets.gte(6)
        },

        name: 'Enna-Generator'
    },
     {
        cost(x) {
            x = E(x)
            return E(1e12).pow(x.add(1))
        },

        get mult() {
            let x = player.generators[9][1].pow_base(2)

            let m = player.generators[9][0].log10().pow_base(2)

            if (player.generators[9][0].gte(1)) x = x.mul(m)

            if (hasNSUpg(4)) x = x.mul(player.planets.pow_base(2))

            if (hasNSUpg(1)) x = x.mul(NSUpgEffect(1))
            
             x = x.mul(CURRENCIES.neutronic_power.effect)

            return x
        },

        get unl() {
            return player.planets.gte(9)
        },

        name: 'Veka-Generator'
    },
    {
        cost(x) {
            x = E(x)
            return E(1e13).pow(x.add(1))
        },

        get mult() {
            let x = player.generators[10][1].pow_base(2)

            let m = player.generators[10][0].log10().pow_base(2)

            if (player.generators[10][0].gte(1)) x = x.mul(m)

            if (hasNSUpg(7)) x = x.mul(player.planets.pow_base(2))

            if (hasNSUpg(1)) x = x.mul(NSUpgEffect(1))

             x = x.mul(CURRENCIES.neutronic_power.effect)

            return x
        },

        get unl() {
            return hasNSUpg(4) && player.planets.gte(12)
        },

        name: 'Meka-Generator'
    },
    {
        cost(x) {
            x = E(x)
            return E(1e14).pow(x.add(1))
        },

        get mult() {
            let x = player.generators[11][1].pow_base(2)

            let m = player.generators[11][0].log10().pow_base(2)

            if (player.generators[11][0].gte(1)) x = x.mul(m)

            if (hasNSUpg(10)) x = x.mul(player.planets.pow_base(2))

            if (hasNSUpg(1)) x = x.mul(NSUpgEffect(1))

             x = x.mul(CURRENCIES.neutronic_power.effect)

            return x
        },

        get unl() {
            return hasNSUpg(7) && player.planets.gte(18)
        },

        name: 'Dodeka-Generator'
    },
]


// Meka-Generator, Dodeka-Generator

function setupGeneratorHTML() {
    let html = ''
    for (let i = 0; i < GENERATORS.length; i++) {
        let h = ``
        h += `<button class="generator" id = "gen-${i}" onclick = "buyGenerator(${i})">
  <div class="gen-top">
    <div class="gen-name" id = "gen-${i}-name">Generator Name (67)</div>
    <div class="gen-amount" id = "gen-${i}-amount">1,439,304</div>
  </div>

  <div class="gen-multiplier" id = "gen-${i}-multiplier">Multiplier: x300</div>

  <div class="gen-cost" id = "gen-${i}-cost">100 FE</div>
</button>


`
        html += h
    }
    el(`generators`).innerHTML = html
}

function updateGeneratorHTML() {
    el('generator-power').innerHTML = `You have <glow>${format(player.generator_power)}</glow> ${formatGain(player.generator_power, CURRENCIES.generator_power.gain)} generator power, multiplying nuclear power gain by <b>x${CURRENCIES.generator_power.effect.format(2)}</b>`
   for (let i = 0; i < GENERATORS.length; i++) {
    el(`gen-${i}-name`).innerHTML = `${GENERATORS[i].name} (${player.generators[i][1].format(0)})`

    el(`gen-${i}-amount`).innerHTML = `${player.generators[i][0].format(0)}`

    el(`gen-${i}-multiplier`).innerHTML = `Multiplier: x${GENERATORS[i].mult.format(2)}`
    
    el(`gen-${i}-cost`).innerHTML = `${GENERATORS[i].cost(player.generators[i][1]).format(0)} FE`

    el(`gen-${i}`).style.display = el_display(GENERATORS[i].unl)
   }
}

function buyGenerator(i) {
    if (player.power.gte(GENERATORS[i].cost(player.generators[i][1]))) {
        player.power = player.power.sub(GENERATORS[i].cost(player.generators[i][1]))
        player.generators[i][0] = player.generators[i][0].add(1)
        player.generators[i][1] = player.generators[i][1].add(1)
    }
}

function updateGENERATORS() {
 for (let i = 0; i < GENERATORS.length; i++) {
    if (i !== 0) player.generators[i - 1][0] = player.generators[i - 1][0].add(player.generators[i][0].mul(GENERATORS[i].mult).div(FPS))
 }
}

function buyMaxGenerator(i) {
    while (GENERATORS[i].unl && player.power.gte(GENERATORS[i].cost(player.generators[i][1]))) {
        player.power = player.power.sub(
            GENERATORS[i].cost(player.generators[i][1])
        );
        player.generators[i][0] = player.generators[i][0].add(1);
        player.generators[i][1] = player.generators[i][1].add(1);
    }
}

function bmg() {
  for (let i = 0; i < GENERATORS.length; i++) {
    buyMaxGenerator(i)
  }
}

document.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "m") {
       bmg()
    }
});

function toggleConfirm(i) {
    player.options.confirm[i] == !player.options.confirm[i]
}