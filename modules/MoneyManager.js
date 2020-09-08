import { trunc2 } from './Helper.js';


let money;

export class MoneyManager {

    constructor(logMan, jsonData) {
        if (jsonData != null) {
            money = jsonData;
        } else {
            money = { points: 0, tokens: 0 };
        }
        this.logMan = logMan;
    }

    getPoints() {
        return money.points;
    }

    getTokens() {
        return money.tokens;
    }

    addPoints(value) {
        if (value === 0) return;
        value = trunc2(value);
        money.points += value;
        this.logMan.addPointsAddEvent(value);
    }

    removePoints(value) {
        money.points -= trunc2(value);
    }

    addTokens(value) {
        value = trunc2(value);
        money.tokens += value;
    }

    removeTokens(value) {
        money.tokens -= trunc2(value);
    }

}