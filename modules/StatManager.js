let stats = {
    time: 0,
    lastRunning: new Date().getTime(),
    highestPointGain: 0,
}

export class StatManager {
    constructor () { }

    stillRunning() {
        let now = new Date().getTime();
        stats.time += now - stats.lastRunning;
        stats.lastRunning = now;
    }

    getPlaytime() {
        return stats.time;
    }

    updateHighestPointGain(points) {
        if (points > stats.highestPointGain) {
            stats.highestPointGain = points;
        }
    }

    getHighestPointGain() {
        return stats.highestPointGain;
    }

}