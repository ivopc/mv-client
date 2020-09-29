import Character from "./character";

class Player extends Character {
    constructor (scene, data) {
        super(scene, data);
        this._data.isPlayer = true;
        this._data.stop = data.stop || false;
        this._data.nickname = data.nickname;
    }

    sendWalk (direction) {}

    sendFacing (direction) {}
};

export default Player;