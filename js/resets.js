let RESETS = {
    neutron_star: {
        get require() { return player.total_power.gte(100) }, 
        reset(force) {
            if (!force) {
                gainCurrency('neutron_star',CURRENCIES.neutron_star.gain)
                player.neutron_star.times++
            }

            this.doReset()
        },
        doReset() {
            PLANETS.reset(true)

            player.planets = E(0)

            if (hasNSUpg(2)) {
                player.planets = E(1)

                player.total_power = E(100)
                player.power = E(100)
            }
        },
    },
}

function doReset(id, force, ...arg) {
    var r = RESETS[id]
    if (force) r.reset(force, ...arg)
    else if (r.require) {
   if (player.options.confirm[id]) {
    if (confirm("are you sure you want to reset?"))  r.reset(false, ...arg)
   } else {
    r.reset(false, ...arg)
   }
    }
}