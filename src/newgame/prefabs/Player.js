import Character from "./Character";
import { CHAR_TYPES } from "@/newgame/constants/Character";

class Player extends Character {
    constructor (scene, data) {
        super(scene, data);
        this._data.isPlayer = true;
        this._data.stop = data.stop || false;
        this._data.type = CHAR_TYPES.PLAYER;
    }

    sendMove (direction) {}

    sendFacing (direction) {}
};

export default Player;