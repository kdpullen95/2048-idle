import { trunc2 } from './Helper.js';

const defMod = {
    cost: { scalar: 1, base: 1, exponent: 1 },
    buy: { add: 0, mult: 1, exponent: 1 },
    active: false,
    isBoardAttr: false,
};

const modifiersBase = {
    pointsMult: { value: 1, bought: 1, cost: { base: 2 }, buy: { mult: 1.2 }, active: true, name: "Points Multiplier" },
    timeout: { value: 1000, bought: 1, cost: { base: 2 }, buy: { mult: 0.95 }, active: true, name: "Shift Speed" },
    reset: { value: 3000, bought: 1, cost: {  base: 2 }, buy: { mult: 0.95 }, name: "Reset Speed" },
    size: { value: 3, bought: 1, cost: { base: 40 }, buy: { add: 1 }, isBoardAttr: true, active: true, name: "Board Size"},
    startTile: { value: 2, bought: 1, cost: { base: 2, exponent: 1.5 }, buy: { add: 1 }, isBoardAttr: true, active: true, name: "Starting Value"},
    dimensions: { value: 2, bought: 1, cost: { base: 18000000, exponent: 0.6 }, buy: { add: 1 }, name: "Dimensions" }
};

let modifiers = {};
let monMan;

function deepMerge(obj1, obj2) {
    const mergedObj = { ...obj1 } ;
    for (const [key, value] of Object.entries(obj2)) {
        if (isObject(obj1[key]) && isObject(obj2[key])) {
            mergedObj[key] = deepMerge(obj1[key], obj2[key]);
        } else {
            mergedObj[key] = value;
        }
    }
    return { ... mergedObj };
}

function isObject(obj) {
    return obj != null && typeof obj === 'object' && !Array.isArray(obj);
}

export class ModifierManager {

    constructor(mM, jsonData) {
        if (jsonData != null) {
            modifiers = jsonData;
        } else {
            for (const [key, value] of Object.entries(modifiersBase)) {
                modifiers[key] = deepMerge(defMod, value);
            }
        }
        monMan = mM;
    }

    activeAndUnsafeModifiers() {
        return Object.keys(modifiers).filter( key => modifiers[key].active && modifiers[key].isBoardAttr);
    }

    activeAndSafeModifiers() {
        return Object.keys(modifiers).filter( key => modifiers[key].active && !modifiers[key].isBoardAttr);
    }

    activeModifiers() {
        return Object.keys(modifiers).filter( key => modifiers[key].active );
    }

    isActive(modifier) {
        return modifiers[modifier].active;
    }

    isBoardAttr(modifier) {
        return modifiers[modifier].isBoardAttr;
    }

    cost(modifier) {
        const prop = modifiers[modifier];
        return Math.trunc(prop.cost.scalar * Math.pow(prop.cost.base, prop.cost.exponent * prop.bought));
    }

    value(modifier) {
        return modifiers[modifier].value;
    }

    name(modifier) {
        return modifiers[modifier].name;
    }

    bought(modifier) {
        return modifiers[modifier].bought;
    }

    canAfford(modifier) {
        return monMan.getPoints() >= this.cost(modifier);
    }

    buy(modifier) {
        if (!this.canAfford(modifier)) return false;
        monMan.removePoints(this.cost(modifier));
        modifiers[modifier].bought++;
        let value = modifiers[modifier].value;
        value += modifiers[modifier].buy.add;
        value *= modifiers[modifier].buy.mult;
        value = Math.pow(value, modifiers[modifier].buy.exponent);
        modifiers[modifier].value = trunc2(value);
        return true;
    }
}