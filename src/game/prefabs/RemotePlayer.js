import Character from "./Character";

import SceneManager from "@/game/managers/SceneManager";

import {
    OVERWORLD_ACTIONS, 
    CHARACTER_OVERWORLD_ACTIONS_HASH,
    LEVEL_P2P_STRUCT
} from "@/game/constants/NetworkEvents";

class RemotePlayer extends Character {
    constructor (scene, data) {
        super(scene, data);
        this.actionQueue = [];
    }

    isActionQueueNotEmpty () {
        return this.actionQueue.length > 0;
    }

    insertActionToQueue (direction) {
        this.actionQueue.push(direction);
    }

    execQueuedAction () {
        // exec the first queued action
        this.move(this.actionQueue[0]);
        // remove the action from actionQueue array
        this.actionQueue.splice(0, 1);
    }

    dispatchAction (payload) {
        if ((this.isActionQueueNotEmpty() || this._data.moveInProgress) && payload[LEVEL_P2P_STRUCT.ACTION_TYPE] === OVERWORLD_ACTIONS.MOVE) {
            this.insertActionToQueue(payload[LEVEL_P2P_STRUCT.DIRECTION]);
        } else {
            this[CHARACTER_OVERWORLD_ACTIONS_HASH[payload[LEVEL_P2P_STRUCT.ACTION_TYPE]]](payload[LEVEL_P2P_STRUCT.DIRECTION]);
        };
    }

    async move (direction) {
        await super.move(direction);
        if (this.isActionQueueNotEmpty())
            this.execQueuedAction();
    }

    static addtoLevel (playerData) {
        const scene = SceneManager.getLevel();
        const gameObject = new RemotePlayer(scene, playerData);
        scene.add.existing(gameObject);
        scene.$charactersController.addRemotePlayerGameObject(gameObject, playerData.userId);
        scene.$containers.main.add(gameObject);
    }
};

export default RemotePlayer;