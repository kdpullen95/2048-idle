let log = [];

function sizeCheck() {
    if (log.length > 15) {
        log.shift();
    }
}

export class LogManager {
    
    constructor(jsonData) {
        if (jsonData != null) {
            log = jsonData;
        }
    }

    getLog() {
        return log;
    }

    push(string) {
        const date = new Date();
        log.push(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${string}`);
        sizeCheck();
    }

    addShiftEvent(info) {
        this.push(`Shifted ${info.direction} and spawned ${info.spawn.length > 0 ? info.spawn.join(', ') : 'nothing'}`);
    }

    addPointsAddEvent(points) {
        this.push(`Gained ${points} points!`);
    }

    addGameOverEvent() {
        this.push('2048: Game over.');
        this.push('Restarting...');
    }

    addUnlockedTrophyEvent(trophy) {
        this.push(`Unlocked trophy ${trophy.name} rank ${trophy.rank}!`);
    }

    addUpgradeEvent(modifier, value, cost, costType) {
        this.push(`Upgraded ${modifier} to ${value} for ${cost} ${costType}`);
    }

}