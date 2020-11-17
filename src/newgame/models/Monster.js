import { Model, ArrayModel } from "objectmodel";

class MonsterModel extends Model({
    id: Number,
    uid: Number,
    monsterpediaId: Number,
    type: Number,
    shiny: Boolean,
    isInitial: Boolean,
    canTrade: Boolean,
    nickname: String,
    level: Number,
    experience: Number,
    gender: Number,
    moves: new ArrayModel(Number),
    statusProblem: Number,
    stats: {
        hp: {
            current: Number,
            total: Number
        },
        mp: {
            current: Number,
            total: Number
        },
        attack: Number,
        defense: Number,
        speed: Number
    },
    dropPoints: {
        hp: Number,
        attack: Number,
        defense: Number,
        speed: Number
    },
    individualPoints: {
        hp: Number,
        attack: Number,
        defense: Number,
        speed: Number
    },
    vitamin: {
        hp: Number,
        attack: Number,
        defense: Number,
        speed: Number
    },
    item: {
        hold: Number,
        catch: Number
    },
    egg: {
        is: Boolean,
        date: Date
    }
}) {
    get healthPercetage () {
        return parseInt((this.stats.hp.current / this.stats.hp.total) * 100);
    }

    get manaPercetage () {
        return parseInt((this.stats.mp.current / this.stats.mp.total) * 100);
    }
}

export default MonsterModel;