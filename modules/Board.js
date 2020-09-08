import { Tile } from './Tile.js';
import { randomValue } from './Helper.js';

let newTileValues;

function newTileValue() {
    return randomValue(newTileValues);
}

const dimensionDirections = {
    1: ["left", "right"],
    2: ["up", "down"],
    3: ["forward", "backward"],
    4: ["ana", "kata"]
}

let sizePower = {};
let points = 0;
let noMove = 0;
let validDirections = [];
let faceOpposite = {};
let dimensions, array;

function initConstants(size, start, dim) {
    dimensions = dim;
    for (let i = dimensions; i >= 1; i--) {
        sizePower[i] = Math.pow(size, i);
        validDirections = validDirections.concat(dimensionDirections[i]);
    }

    sizePower[0] = 1; //0th dimension case
    
    newTileValues = [start, 2 * start];

    for (let i = dimensions; i > 0; i--) {
        dimensionDirections[i].forEach( (direction, index) => {
            generateFaceOpposite(direction, i, !!index); //cast 0, 1 to bool
        });
    }

    console.log(faceOpposite);
}

function generateFaceOpposite(direction, dimension, start) {
    let baseArr = [];
    // generate the "base" values (what the 'face' [an object of 1 dimension lower at the start/end of 
    // the higher-dimensional object] would be in the dimension that they reside in)
    for (let i = 0; i < sizePower[dimension - 1]; i++) {
        baseArr.push(start ? i : sizePower[dimension] - 1 - i); //wasteful but easier for me to understand
                                                            //-1 is zero-indexing
    }
    let fullArr = baseArr.slice(); 
    //repeat those "base" values for every "slice" of higher dimension than the starting one, exponentially
    //this creates the "side" values out of the "base"
    for (let i = dimension; i < dimensions; i++) {
        for (let j = 1; j < sizePower[1]; j++) { //sizePower[1] because each increase is only squared up
                                                //starts at 1 because the 0th is already constructed for the given dimension
            //to the fullArr, add size * baseArr.length new values that are the original positions, offset by each new slice
            fullArr = fullArr.concat(baseArr.map( pos => pos +  j * sizePower[dimension] )); 
        }
        baseArr = fullArr.slice(); //construct the nth dimension face for the next dimensional iteration of slices
    }
    //assign to faceOpposite[direction] (no need for reflection more than once)
    faceOpposite[direction] = fullArr;
}

function resetPoints() {
    noMove = 0;
    points = 0;
}

function shiftTile(pos, delta, min, max) {
    //if the tile is empty, no need to check. stop
    if (array[pos].isEmpty()) {
        return;
    }

    //console.log(`arguments - pos: ${pos} | delta: ${delta} | min: ${min} | max: ${max}`);

    //move one unit in the desired direction
    let searchPos = pos + delta;

    //repeat while 1. in bounds and 2. empty
    while(searchPos >= min && searchPos < max && array[searchPos].isEmpty()) {
        searchPos += delta;
    }

    //if it's in bounds and able to merge, merge and stop
    if (searchPos >= min && searchPos < max && array[searchPos].merge(array[pos])) {
        //console.log(`this tile is being merged into ${searchPos}`);
        points += array[searchPos].value;
        resetTile(pos);
    } else {

        //else back up one block (which should always be free
        //and always in bounds because of checks in while loop
        searchPos -= delta;

        //slide that tile into position
        //console.log(`this tile is being slid into position ${searchPos}`);
        updateTile(pos, searchPos);

    }
}


function spawnTile(spawnArr) {
    const spawn = [];
    spawnArr.forEach(entry => {
        if (array[entry].isEmpty()) {
            spawn.push(entry);
        }
    });
    if (spawn.length > 0) {
        const value = newTileValue();
        array[randomValue(spawn)] = new Tile(value);
        return value;
    }
}

function updateTile(oldPos, newPos) {
    if (oldPos === newPos) {
        noMove++;
        return;
    }
    array[newPos] = array[oldPos];
    resetTile(oldPos);
}

function resetTile(oldPos) {
    array[oldPos] = new Tile(0);
}

const shiftFunc = {
    up: () => {
        for (let i = 0; i < sizePower[2]; i++) {
            shiftTile(i, -1 * sizePower[1], 0, sizePower[2]);
        }
    },
    down: () => {
        for (let i = sizePower[2] - 1; i > -1; i--) {
            shiftTile(i, sizePower[1], 0, sizePower[2]);
        }
    },
    left: () => {
        for (let i = 0; i < sizePower[1]; i++) {
            for (let j = 0; j < sizePower[1]; j++) {
                shiftTile(i * sizePower[1] + j, -1, i * sizePower[1], (i + 1) * sizePower[1]);
            }
        } 
    },
    right: () => {
        for (let i = 1; i <= sizePower[1]; i++) {
            for (let j = 1; j <= sizePower[1]; j++) {
                shiftTile(i * sizePower[1] - j, 1, (i - 1) * sizePower[1], i * sizePower[1]);
            }
        }
    }
}

export class Board {
    
    constructor(size, dim, start) {
        console.log(`Creating new board of size ${size}, dimension ${dim}, and start tile of ${start}`);
        this.size = size;
        initConstants(size, start, dim);
        this.resetBoard();
    }

    getBoard() {
        return array;
    }

    resetBoard() {
        array = [];
        for(let i = 0; i < sizePower[dimensions]; i++) {
            array.push(new Tile(0));
        }
    }

    shift(direction) {
        resetPoints();
        shiftFunc[direction]();
        //todo dynamic spawning based on dimension & modifiers
        const s = spawnTile(faceOpposite[direction]);
        return { direction: direction, spawn: [s] };
    }

    shiftRandom() {
        return this.shift(randomValue(validDirections));
    }

    getPoints() {
        if (noMove === sizePower[dimensions]) {
            return -1;
        }
        return points;
    }

}


