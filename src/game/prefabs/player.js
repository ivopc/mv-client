import Character from "./Character";

import PlayerData from "@/game/managers/PlayerData";

import { CHAR_TYPES } from "@/game/constants/Character";
import { TILE } from "@/game/constants/Overworld";
import { OVERWORLD_ACTIONS } from "@/game/constants/NetworkEvents";

class Player extends Character {
    constructor (scene, data) {
        super(scene, data);
        this._data.isPlayer = true;
        this._data.stop = data.stop || false;
        this._data.setType(CHAR_TYPES.PLAYER);
    }
    
    async move (direction) {
        if (this._data.moveInProgress || this._data.stop)
            return;
        switch (await super.move(direction)) {
            case TILE.TYPES.DEFAULT:
            case TILE.TYPES.WARP:
            case TILE.TYPES.WILD_GRASS:
            case TILE.TYPES.EVENT:
            {
                PlayerData.ref.setPosition(this._data.position);
                break;
            };
        };
    }

    startToMove (direction, older) {
        super.startToMove(direction, older);
        this.sendMove(direction);
    }

    face (direction) {
        if (this._data.moveInProgress)
            return;
        const oldFacing = this._data.position.facing;
        super.face(direction);
        if (oldFacing !== direction)
            this.sendFacing(direction);
        PlayerData.ref.setFacing(direction);
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
            OVERWORLD_ACTIONS.FACE
        );
    }

    requestLevelChange () {
        const teleport = this.scene.$levelBehavior.scriptData.map.teleport
            .find(({ x, y }) =>
                x === this._data.position.x && 
                y === this._data.position.y
            );
        this.scene.$manager.changeLevel(teleport);
    }
};

export default Player;