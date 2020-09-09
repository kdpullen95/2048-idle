let trophies = {
    hr: { name: "High Roller", max: -1, rank: 0, trigger: function() { return monMan.getPoints() > 50000 * Math.pow(2, trophies.hr.rank + 2) } },
    bg: { name: "Big Gains", max: -1, rank: 0, trigger: function() { return staMan.getHighestPointGain() > 10 * Math.pow(2, trophies.bg.rank + 3 ) } },
    ts: { name: "Time Sink", max: -1, rank: 0, trigger: function() { return staMan.getPlaytime() > 3600000 * (trophies.ts.rank + 1) } },
    tbinl: { name: "The Board is Large", max: -1, rank: 0, trigger: function() { return modMan.value('size') > trophies.tbinl.rank + 3 && modMan.value('size') !== 4 } },
    tbinns: { name: "The Board is Medium", max: 1, rank: 0, trigger: function() { return modMan.value('size') === 4 } },
    tbis: { name: "The Board is Small", max: 1, rank: 0, trigger: function() { return modMan.value('size') === 2 } },
};

let modMan, monMan, staMan, logMan;
let modifier = 1;

export class TrophyManager {
    
    //todo what is the naming conventions when you have to rename the constructor arguments?
    constructor(modMan_, monMan_, staMan_, logMan_) { 
        modMan = modMan_;
        monMan = monMan_;
        staMan = staMan_;
        logMan = logMan_;
        this.updateTrophiesModifier();
    };

    sortedTrophies() {
        //todo sort in what way?
        return trophies;
    }

    getTrophiesRank() {
        return Object.values(trophies).map( trophy => trophy.rank ).reduce((x, y) => x + y); //easier to write but requires two loops // TODO revist if large number of trophies
    }

    updateTrophiesModifier() {
        modifier = Math.pow(1.2, this.getTrophiesRank());
    }

    getTrophiesModifier() {
        return modifier;
    }

    runCheck() {
        let bought = false;
        Object.values(trophies).forEach( (trophy) => {
            if ((trophy.max === -1 || trophy.max > trophy.rank) && trophy.trigger()) {
                trophy.rank++;
                bought = true;
                logMan.addUnlockedTrophyEvent(trophy);
            }
        });
        if (bought) {
            this.updateTrophiesModifier();
        }
    }

}