import Database from "@/game/managers/Database";

import { merge } from "@/lib/utils";

class MonsterModel {
    constructor (data) {
        merge(this, data);
    }

    get healthPercetage () {
        return (this.current_HP / this.stats_HP) * 100;
    }

    get manaPercetage () {
        return (this.current_MP / this.stats_MP) * 100;
    }

    get expStatistics () {
        const 
            levelTotalCurrent = Database.ref.monstersExp.find(exp => exp.level === this.level),
            levelTotalNext = Database.ref.monstersExp.find(exp => exp.level === this.level + 1),
            total = levelTotalNext.exp - levelTotalCurrent.exp,
            current = this.experience - levelTotalCurrent.exp;
        return {
            current,
            total,
            nextTotal: levelTotalNext.exp,
            percentage: (current / total) * 100
        };
    }

    get isAlive () {
        return this.current_HP > 0;
    }

    get allStatsSum () {
        return this.stats_attack + this.stats_defense + this.stats_speed + this.stats_HP + this.stats_MP;
    }

    getName () {
        return this.nickname || Database.ref.monster[this.monsterpedia_id].name;
    }

    get numberToPedia () {
        // right, we need to refactor this
        const num = String(this.monsterpedia_id);
        if (num.length === 1)
            return "00" + num;
        if (num.length === 2)
            return "0" + num;
        return num;
    }
};

export default MonsterModel;