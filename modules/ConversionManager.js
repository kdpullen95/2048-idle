import { round2 } from "./Helper.js";

export class ConversionManager {

    constructor() { }

    print(value) {
        return value > 1000000 ? value.toExponential(3) : round2(value);
    }

    printTile(value) {
        return value > 10000 ? value.toExponential(2) : value;
    }
}