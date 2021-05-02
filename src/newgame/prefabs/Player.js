import Character from "./Character";

import { CHAR_TYPES } from "@/newgame/constants/Character";



class Player extends Character {
    constructor (scene, data) {
        super(scene, data);
        this._data.isPlayer = true;
        this._data.stop = data.stop || false;
        this._data.type = CHAR_TYPES.PLAYER;
    }

    sendMove (direction) {
        this.scene.$network.sendMove(direction);
    }

    sendFacing (direction) {
        this.scene.$network.sendFacing(direction);
    }

    requestLevelChange () {
        const teleport = this.scene.$levelBehavior.scriptData.map.teleport
            .find(position => 
                position.x === this._data.position.x && 
                position.y === this._data.position.y);
        this.scene.$manager.changeLevel(teleport);
    }

    interact () {
        const interaction = super.interact();
    }
};

export default Player;