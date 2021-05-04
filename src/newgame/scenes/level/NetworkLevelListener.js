import Network from "@/newgame/managers/Network";
import LevelData from "@/newgame/managers/LevelData";

import { 
    LEVEL_EVENTS, 
    OVERWORLD_ACTIONS 
} from "@/newgame/constants/NetworkLevelEvents";

/*
    dispatchLevelData
    dataType:
    1 = char moving
    2 = char facing
    3 = remove char from map
*/
// in the channels of level change 'm' to 'l'

class NetworkLevelListener {
    constructor (scene) {
        this.scene = scene;
        this.subscribe = {
        	level: {
                isSubscribed: false
            }
        };
    }

    addListener () {
        Network.ref
            .addEvent(LEVEL_EVENTS.PONG, () => this.ping())
            .addEvent(LEVEL_EVENTS.CHAT_MESSAGE, payload => this.newChatMessage(payload));
    }

    removeListener () {
        Object.keys(LEVEL_EVENTS)
            .forEach(event => Network.ref.removeEvent(LEVEL_EVENTS[event]));
    }

    subscribeLevel (levelId) {
        levelId = levelId || LevelData.ref.id;
    	this.subscribe.level.conn = Network.ref.socket.subscribe("m" + levelId);
    	this.subscribe.level.conn.watch(payload => this.dispatchLevelPayload(payload));
        // TODO: we need a better soluction based on a network event
        this.subscribe.level.isSubscribed = true;
    }

    unsubscribeLevel (levelId) {
        //levelId = levelId || LevelData.ref.id;
        this.subscribe.level.conn.unsubscribe();
        this.subscribe.level.conn.unwatch();
        // TODO: we need a better soluction based on a network event
        this.subscribe.level.isSubscribed = false;
        //Network.ref.socket.unwatch("m" + levelId);
    }

    sendCharacterOverworldAction (dir, dataType) {
        if (!this.subscribe.level.isSubscribed)
            return;
        this.subscribe.level.conn.publish({ dir, dataType });
    }

    dispatchLevelPayload (payload) {
        switch (payload.dataType) {
            case OVERWORLD_ACTIONS.MOVE:
            case OVERWORLD_ACTIONS.FACING:
            {
                this.scene.$charactersController.handleRemotePlayerData(payload);
                break;
            };
        };
    }
};

export default NetworkLevelListener;