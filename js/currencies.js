const CURRENCIES = {
    power: {
        get amount() { return player.power },
        set amount(v) { player.power = v.max(0) },

        get total() { return player.total_power },
        set total(v) { player.total_power = v.max(0) },
    
        get gain() {
            let x = E(1)

            x = x.mul(player.power_mult)

            x = x.mul(CURRENCIES.generator_power.effect)

            if (hasNSUpg(0)) x = x.mul(NSUpgEffect(0))

            if (hasNSUpg(5)) x = x.pow(NSUpgEffect(5))
            
            if (hasNSUpg(8)) x = x.pow(NSUpgEffect(8))
            
            let sc = 0

            if (hasNSUpg(12)) sc += 0.05

            x = x.overflow('e1000', E(0.8).add(sc).min(1))

            x = x.overflow('e10000', E(0.7).add(sc).min(1))



            return x
        },
    },
    generator_power: {
        get amount() { return player.generator_power },
        set amount(v) { player.generator_power = v.max(0) },

        get total() { return player.total_generator_power },
        set total(v) { player.total_generator_power = v.max(0) },
    
        get gain() {
            let x = player.generators[0][0].mul(GENERATORS[0].mult)

            if (hasNSUpg(9)) x = x.pow(NSUpgEffect(9))

            return x
        },

        get effect() {
            let x = player.generator_power
            let pb = E(2.5)

            if (hasNSUpg(6)) pb = pb.add(0.25)

            if (x.eq(0)) return E(1)
            
            let sc = 0

            if (hasNSUpg(13)) sc += 0.05

            x = x.overflow('1e1000', E(0.75).add(sc).min(1))

            x = x.overflow('1e250000', E(0.5).min(1))

            return x.log10().pow_base(pb)
        }
    },
    neutron_star: {
        get amount() { return player.neutron_star.amount },
        set amount(v) { player.neutron_star.amount = v.max(0) },

        get req() { return E(1e100)},

        name: "Neutron Stars",
        costName: "Neutron Stars",

        get total() { return player.neutron_star.total },
        set total(v) { player.neutron_star.total = v.max(0) },
    
        get gain() {
            let x = E(2).pow(player.total_power.log10().div(100).sub(1))

            x = x.mul(player.total_power.log10().pow(0.5).sub(10).max(1))

            if (player.planets.gte(12)) x = x.mul(player.planets.sub(10).overflow(10, 0.75))

            x = x.overflow('1e15', 0.5)

            return x
        },

        get passive() { return hasNSUpg(14) ? 1 : 0 }
    },
    neutronic_power: {
        get amount() { return player.neutron_star.neutronic_power },
        set amount(v) { player.neutron_star.neutronic_power = v.max(0) },

        get total() { return player.neutron_star.total_neutronic_power },
        set total(v) { player.neutron_star.total_neutronic_power = v.max(0) },
    
        get gain() {
            let x = player.neutron_star.generators[0][0].mul(N_GENERATORS[0].mult)

            return x
        },

        get effect() {
            let x = player.neutron_star.neutronic_power

            let pb = 1000

            if (x.eq(0)) return E(1)

            //x = x.overflow('1e1000', 0.75)

            return x.log10().pow_base(pb)
        }
    },
}

function setupCurrencies() {
   
}

function gainCurrency(id,amt) {
    var curr = CURRENCIES[id]
    curr.amount = curr.amount.add(amt)
    if ('total' in curr) curr.total = curr.total.add(amt)
}