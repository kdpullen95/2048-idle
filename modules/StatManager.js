let stats = {
    time: 0,
    lastRunning: new Date().getTime(),
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

}