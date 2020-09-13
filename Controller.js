import { MoneyManager } from './modules/MoneyManager.js';
import { ModifierManager } from './modules/ModifierManager.js';
import { Board } from './modules/Board.js';
import { LogManager } from './modules/LogManager.js';
import { TrophyManager } from './modules/TrophyManager.js'; 
import { StatManager } from './modules/StatManager.js';
import { ConversionManager } from './modules/ConversionManager.js';

const conMan = new ConversionManager();
const logMan = new LogManager();
const monMan = new MoneyManager(logMan);
const modMan = new ModifierManager(monMan);
const staMan = new StatManager();
const troMan = new TrophyManager(modMan, monMan, staMan, logMan);

let board;
let container;
initBoard();

document.addEventListener("DOMContentLoaded", () =>  {
    console.log("~~DOM initialized.");
    //creates the Vue game window
    container = new Vue({
        el: '#vue-activator',
        data: {
          board: board.getBoard(),
          size: modMan.value('size'),
          points: monMan.getPoints(),
          tokens: monMan.getTokens(),
          log: logMan.getLog(),
          cellSize: '60px',
          modMan: modMan,
          troMan: troMan,
          staMan: staMan,
          conMan: conMan,
          selectedTab: 'boardPage',
        },
        methods: {
            computedGridStyle() {
                return { gridTemplateColumns: 'repeat('+ this.size + ', ' + this.cellSize + ')', gridTemplateRows: 'repeat(' + this.size + ', ' + this.cellSize + ')' };
            },
            computedCellSize() {
                return { height: this.cellSize, width: this.cellSize };
            },
            updateBoard: function() {
                this.points = monMan.getPoints();
                this.tokens = monMan.getTokens();
                this.log = logMan.getLog();
                this.board = board.getBoard();
            },
            fullReset: function() {
                initBoard();
                this.size = modMan.value('size');
                this.updateBoard();
            },
            buy: function(modifier) {
                if (modMan.buy(modifier) && modMan.isBoardAttr(modifier)) {
                    this.fullReset();
                } else {
                    this.updateBoard();
                }
            }
        }
    });
    //starts the game loop
    iteration();
});

function iteration() {
    let shift = board.shiftRandom();
    let p = board.getPoints();
    if (p === -1) {
        shift = board.shiftUntilMove();
        p = board.getPoints();
    }
    logMan.addShiftEvent(shift);
    if (p === -1) {
        container.updateBoard();
        logMan.addGameOverEvent();
        //pauses for a second on 'game over'
        setTimeout(reset, modMan.value("reset"));
    } else {
        monMan.addPoints(p * modMan.value("pointsMult") * troMan.getTrophiesModifier());
        container.updateBoard();
        //continues the game loop
        setTimeout(iteration, modMan.value("timeout"));  
    }
    staMan.updateHighestPointGain(p);
    staMan.stillRunning();
    troMan.runCheck();
}

function reset() {
    board.resetBoard();
    container.updateBoard();
    //continues the game loop
    setTimeout(iteration, modMan.value("timeout"));
}

function initBoard() {
    board = new Board(modMan.value('size'), modMan.value('dimensions'), modMan.value('startTile'), modMan); 
}