import Assets from "./Assets";
import Database from "./Database";

class MapData {

    constructor (data) {
        this.id = data.map;
        this.wild = data.wild;
        this.flag = data.flag;
        this.tamers = data.tamers;
    }

    get hasTamers () {
        return this.tamers.length > 0;
    }

    static ref
};

export default MapData;