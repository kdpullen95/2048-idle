export class Tile {
    value = 0;
    
    constructor(value) {
        this.value = value;
    }

    merge(tile) {
        if (tile.value === this.value) {
            this.value += tile.value;
            return true;
        } else {
            return false;
        }
    }

    isEmpty() {
        return this.value === 0;
    }
}