import Assets from "./Assets";
import Database from "./Database";

class LevelModel {
    static create ({ level, wild, flag, tamers }) {
        this.id = level;
        this.wild = wild;
        this.flag = flag;
        this.tamers = tamers;
        this.script;
    }

    static get hasTamers () {
        return this.tamers.length > 0;
    }

    static setScript (data) {
        this.script = data;
    }

    static update (newLevelData) {
        this.id = newLevelData.id;
    }
};

export default LevelModel;