import { Tile } from './Tile.js';
import { randomValue, randomValueSet } from './Helper.js';

let newTileValues;

function newTileValue() {
    return randomValue(newTileValues);
}

const dimensionDirections = {
    1: ["right", "left"],
    2: ["down", "up"],
    3: ["backward", "forward"],
    4: ["kata", "ana"]
}

let sizePower = {};
let points = 0;
let noMove = 0;
let validDirections = [];
let face = {};
let faceInfo = {};
let dimensions, array, modMan;

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
            generateInfo(direction, i, !!index); //cast 0, 1 to bool
            generateFace(direction, i, !!index); 
        });
    }
}

function generateInfo(direction, dimension, start) {
    faceInfo[direction] = { 
        dimension: dimension, 
        opposite: start ? dimensionDirections[dimension][0] : dimensionDirections[dimension][1], 
        start: start,
        baseSpawn: 1
    };
}

function generateFace(direction, dimension, start) {
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
    //assign to face[direction] (no need for reflection more than once)
    face[direction] = fullArr;
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

function spawnTileDir(direction) {
    return spawnTile(face[faceInfo[direction].opposite], faceInfo[direction].baseSpawn + modMan.value('spawnNumber'));
}


function spawnTile(spawnArr, numberOf) {
    const spawn = new Set(), addArr = [];
    spawnArr.forEach(entry => {
        if (array[entry].isEmpty()) {
            spawn.add(entry);
        }
    });
    for (let i = 0; i < numberOf && spawn.size > 0; i++) {
        const value = newTileValue();
        const pos = randomValueSet(spawn);
        array[pos] = new Tile(value);
        addArr.push(value);
        spawn.delete(pos);
    }
    return addArr;
}

function updateTile(oldPos, newPos) {
    if (oldPos === newPos) {
        noMove++;
        return;
    }
    array[newPos] = array[oldPos];
    resetTile(oldPos);
}

function resetTile(pos) {
    array[pos] = new Tile(0);
}

function shiftLoop(direction) {
    const faceDim = faceInfo[direction].dimension;
    let sign = faceInfo[direction].start ? 1 : -1;

    for (let i = 0; i < sizePower[1]; i++) {
        face[direction].forEach( (pos) => {
            pos += (sizePower[faceDim - 1] * i * sign); //position is offset by a "column"/slice
            const min = Math.floor(pos/sizePower[faceDim]) * sizePower[faceDim]; //box it in by nearest size^dimension box
            const max = min + sizePower[faceDim];           //ex for dim 2, 0-64, 64-128, etc
            //console.log(`min: ${min}, max: ${max}, shift: ${sign * -1 * sizePower[faceDim - 1]}, pos: ${pos}`);
            shiftTile(pos, sign * -1 * sizePower[faceDim - 1], min, max);
        });
    }

}

export class Board {
    
    constructor(size, dim, start, modMan_) {
        console.log(`Creating new board of size ${size}, dimension ${dim}, and start tile of ${start}`);
        this.size = size;
        initConstants(size, start, dim);
        modMan = modMan_;
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
        shiftLoop(direction);
        return { direction: direction, spawn: spawnTileDir(direction) };
    }

    shiftRandom() {
        return this.shift(randomValue(validDirections));
    }

    shiftUntilMove() {
        for (let i = 0; i < validDirections.length; i++) {
            const direction = validDirections[i];
            this.shift(direction);
            if (noMove !== sizePower[dimensions]) {
                return  { direction: direction, spawn: spawnTileDir(direction) };
            }
        }
        return { direction: 'nowhere', spawn: [] }
    }

    getPoints() {
        if (noMove === sizePower[dimensions]) {
            return -1;
        }
        return points;
    }

}


