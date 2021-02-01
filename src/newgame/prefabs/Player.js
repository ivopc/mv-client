import Character from "./Character";

class Player extends Character {
    constructor (scene, data) {
        super(scene, data);
        this._data.isPlayer = true;
        this._data.stop = data.stop || false;
        this._data.type = 0;
        console.log(this._data);
    }

    sendWalk (direction) {}

    sendFacing (direction) {}
};

export default Player;