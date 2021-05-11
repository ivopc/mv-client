import Character from "./Character";

import { CHAR_TYPES } from "@/newgame/constants/Character";
import { OVERWORLD_ACTIONS } from "@/newgame/constants/NetworkLevelEvents";

class Player extends Character {
    constructor (scene, data) {
        super(scene, data);
        this._data.isPlayer = true;
        this._data.stop = data.stop || false;
        this._data.setType(CHAR_TYPES.PLAYER);
    }

    sendMove (direction) {
        this.scene.$network.sendCharacterOverworldAction(
            direction, 
            OVERWORLD_ACTIONS.MOVE
        );
    }

    sendFacing (direction) {
        this.scene.$network.sendCharacterOverworldAction(
            direction, 
            OVERWORLD_ACTIONS.FACING
        );
    }

    requestLevelChange () {
        const teleport = this.scene.$levelBehavior.scriptData.map.teleport
            .find(position => 
                position.x === this._data.position.x && 
                position.y === this._data.position.y
            );
        this.scene.$manager.changeLevel(teleport);
    }

    interact () {
        const interaction = super.interact();
    }
};

export default Player;