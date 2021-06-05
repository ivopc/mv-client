import Assets from "./Assets";
import Database from "./Database";

class LevelData {

    constructor (data) {
        this.id = data.level;
        this.wild = data.wild;
        this.flag = data.flag;
        this.tamers = data.tamers;
        this.script;
    }

    get hasTamers () {
        return this.tamers.length > 0;
    }

    setScript (data) {
        this.script = data;
    }

    update (newLevelData) {
        this.id = newLevelData.id;
    }

    static ref
};

export default LevelData;