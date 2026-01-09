let NS_UPGRADES = [
    {
        name: "Nuclear Booster",
        desc: "Nuclear Power is multiplied by log(np)",

        cost: E(1),

        get effect() {
            return player.power.max(10).log10()
        }
    },
    {
        name: "Nuclear Fuel",
        desc: "Generator multipliers are boosted by nuclear power at a reduced rate",

        cost: E(3),

        get effect() {
            return player.total_power.max(10).log10().pow(0.5)
        }
    },
    {
        name: "Starter Pack + Refined Refiner",
        desc: "The refiner is boosted, and resets nothing, you also start with 1 planet and 100 FE of nuclear power",

        cost: E(10),

        get effect() {
            return E(3)
        }
    },
    {
        name: "Better Planets",
        desc: "Planets no longer reset your stuff, and the dumb scaling at 9 planets is removed too (its there for no reason)",

        cost: E(50),

        get effect() {
            return false
        }
    },
    {
        name: "Meka-Generator",
        desc: "Unlock the eleventh generator, also the tenth generator gets the planet boost effect.",

        cost: E(250),

        get effect() {
            return false
        }
    },
    {
        name: "Nuclear GP",
        desc: "Generator Power gains an additional boost to Nuclear Power",

        cost: E(1000),

        get effect() {
            return player.generator_power.max(10).log(10).div(10000).add(1).max(1).overflow(5, 0.1)
        }
    },
    {
        name: "A better formula",
        desc: "Improve the generator power formula",

        cost: E(5000),

        get effect() {
            return false
        }
    },
    {
        name: "Dodeka-Generator",
        desc: "Unlock the twelfth and final generator, the eleventh gets the planet boost effect.",

        cost: E(25000),

        get effect() {
            return false
        }
    },
    {
        name: "Nuclear Neutrons",
        desc: "Nuclear Power gain is boosted by Neutron Stars at a reduced rate",

        cost: E(1e6),

        get effect() {
            return player.neutron_star.total.max(10).log10().div(50).add(1).overflow(2, 0.1)
        }
    },
    {
        name: "Generator Neutrons",
        desc: "Generator Power gain is boosted by Neutron Stars at a reduced rate",

        cost: E(1e7),

        get effect() {
            return player.neutron_star.total.max(10).log10().div(100).add(1).overflow(5, 0.1)
        }
    },
    {
        name: "Dodeka-Booster",
        desc: "The twelfth generator gets the planet boost effect",

        cost: E(1e8),

        get effect() {
            return false
        }
    },

    {
        name: "Neutronic Generators",
        desc: "Unlock the next feature, and automation (in options for now).",

        cost: E(1e9),

        get effect() {
            return false
        }
    },
    {
        name: "Weaken the power softcaps!",
        desc: "Weakens the nuclear power softcaps.",

        cost: E(1e35),

        get effect() {
            return false
        }
    },
    {
        name: "Weaken the generator power softcaps!",
        desc: "Weakens the generator power softcap.",

        cost: E(1e45),

        get effect() {
            return false
        }
    },
    {
        name: "Neutronic Automation",
        desc: "Automates neutron stars.",

        cost: E(1e60),

        get effect() {
            return false
        }
    },
    {
        name: "Neutronic Energy",
        desc: "Unlock the next feature (coming soon!).",

        cost: E(1e63),

        get effect() {
            return false
        }
    },
]

function buyNSUpg(i) {
    if (!hasNSUpg(i)) {
    let c = NS_UPGRADES[i].cost
    if (player.neutron_star.amount.gte(c)) {
        player.neutron_star.amount = player.neutron_star.amount.sub(c)
        player.neutron_star.upgrades.push(i)
    }
 }
}

function setupNSUpgs() {
    let h = ''
    for (let i = 0; i < NS_UPGRADES.length; i++) {
        let b = `<button class = "ns-upgrade" id = "ns-upgrade-${i}" onclick = "buyNSUpg(${i})">
        <b>${NS_UPGRADES[i].name}</b>
        <p>${NS_UPGRADES[i].desc}</p>
        <p id = "ns-cost-${i}">Cost: ${NS_UPGRADES[i].cost.format(0)} Neutron Stars</p></button>`
        h += b
    }
   el('ns-upgrades').innerHTML = h
}

function updateNSUpgs() {
for (let i = 0; i < NS_UPGRADES.length; i++) {
        el(`ns-upgrade-${i}`).classList = el_classes({bought: hasNSUpg(i), 'ns-upgrade': true})
        el(`ns-cost-${i}`).innerHTML = `Cost: ${NS_UPGRADES[i].cost.format(0)} Neutron Stars`
    }
}

function hasNSUpg(i) {return player.neutron_star.upgrades.includes(i)}

function NSUpgEffect(i) {return NS_UPGRADES[i].effect}


//Neutronic generator

let N_GENERATORS = [
    {
        cost(x) {
            x = E(x)
            return E(1e9).pow(x.add(1))
        },

        get mult() {
            let x = player.neutron_star.generators[0][1].pow_base(2)

            let m = player.neutron_star.generators[0][0].log10().pow_base(1.5)

            if (player.neutron_star.generators[0][0].gte(1)) x = x.mul(m)

            return x
        },

        get unl() {
            return hasNSUpg(11)
        },

        name: 'Trideka-Generator'
    },
    {
        cost(x) {
            x = E(x)
            return E(1e11).pow(x.add(1))
        },

        get mult() {
            let x = player.neutron_star.generators[1][1].pow_base(2)

            let m = player.neutron_star.generators[1][0].log10().pow_base(1.5)

            if (player.neutron_star.generators[1][0].gte(1)) x = x.mul(m)

            return x
        },

        get unl() {
            return player.neutron_star.generators[0][1].gte(1)
        },

        name: 'Tetradeka-Generator'
    },
    {
        cost(x) {
            x = E(x)
            return E(1e15).pow(x.add(1))
        },

        get mult() {
            let x = player.neutron_star.generators[2][1].pow_base(2)

            let m = player.neutron_star.generators[2][0].log10().pow_base(1.5)

            if (player.neutron_star.generators[2][0].gte(1)) x = x.mul(m)

            return x
        },

        get unl() {
            return player.neutron_star.generators[1][1].gte(1)
        },

        name: 'Pentadeka-Generator'
    },
    {
        cost(x) {
            x = E(x)
            return E(1e33).pow(x.add(1))
        },

        get mult() {
            let x = player.neutron_star.generators[3][1].pow_base(2)

            let m = player.neutron_star.generators[3][0].log10().pow_base(1.5)

            if (player.neutron_star.generators[3][0].gte(1)) x = x.mul(m)

            return x
        },

        get unl() {
            return player.neutron_star.generators[2][1].gte(1)
        },

        name: 'Hexadeka-Generator'
    },
    
]


function setupNeutronicGeneratorHTML() {
    let html = ''
    for (let i = 0; i < N_GENERATORS.length; i++) {
        let h = `<button class="neutron generator" id = "n_gen-${i}" onclick = "buyNeutronicGenerator(${i})">
  <div class="gen-top">
    <div class="gen-name" id = "n_gen-${i}-name">Generator Name (67)</div>
    <div class="gen-amount" id = "n_gen-${i}-amount">1,439,304</div>
  </div>

  <div class="gen-multiplier" id = "n_gen-${i}-multiplier">Multiplier: x300</div>

  <div class="gen-cost" id = "n_gen-${i}-cost">100 FE</div>
</button>`
     html += h
    }
    el('neutronic-generators').innerHTML = html
}

function updateNeutronicGeneratorHTML() {
    el('neutronic-power').innerHTML = `You have <glow>${format(player.neutron_star.neutronic_power)}</glow> ${formatGain(player.neutron_star.neutronic_power, CURRENCIES.neutronic_power.gain)} FE of neutronic power, boosting all generator multipliers by <b>x${CURRENCIES.neutronic_power.effect.format(2)}</b>`
   for (let i = 0; i < N_GENERATORS.length; i++) {
    el(`n_gen-${i}-name`).innerHTML = `${N_GENERATORS[i].name} (${player.neutron_star.generators[i][1].format(0)})`

    el(`n_gen-${i}-amount`).innerHTML = `${player.neutron_star.generators[i][0].format(0)}`

    el(`n_gen-${i}-multiplier`).innerHTML = `Multiplier: x${N_GENERATORS[i].mult.format(2)}`
    
    el(`n_gen-${i}-cost`).innerHTML = `${N_GENERATORS[i].cost(player.neutron_star.generators[i][1]).format(0)} Neutron Stars`

    el(`n_gen-${i}`).style.display = el_display(N_GENERATORS[i].unl)
   }
}

function buyNeutronicGenerator(i) {
    if (player.neutron_star.amount.gte(N_GENERATORS[i].cost(player.neutron_star.generators[i][1]))) {
        player.neutron_star.amount = player.neutron_star.amount.sub(N_GENERATORS[i].cost(player.neutron_star.generators[i][1]))
        player.neutron_star.generators[i][0] = player.neutron_star.generators[i][0].add(1)
        player.neutron_star.generators[i][1] = player.neutron_star.generators[i][1].add(1)
    }
}

function updateNeutronicGenerators() {
 for (let i = 0; i < N_GENERATORS.length; i++) {
    if (i !== 0) player.neutron_star.generators[i - 1][0] = player.neutron_star.generators[i - 1][0].add(player.neutron_star.generators[i][0].mul(N_GENERATORS[i].mult).div(FPS))
 }
}
