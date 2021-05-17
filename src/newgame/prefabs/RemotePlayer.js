import Character from "./Character";

import {
    OVERWORLD_ACTIONS, 
    CHARACTER_OVERWORLD_ACTIONS_HASH 
} from "@/newgame/constants/NetworkLevelEvents";

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
        if ((this.isActionQueueNotEmpty() || this._data.moveInProgress) && payload.dataType === OVERWORLD_ACTIONS.MOVE) {
            this.insertActionToQueue(payload.dir);
        } else {
            this[CHARACTER_OVERWORLD_ACTIONS_HASH[payload.dataType]](payload.dir);
        };
    }

    async move (direction) {
        await super.move(direction);
        if (this.isActionQueueNotEmpty())
            this.execQueuedAction();
    }
};

export default RemotePlayer;