import Network from "@/newgame/managers/Network";
import LevelData from "@/newgame/managers/LevelData";

import { 
    LEVEL_EVENTS, 
    OVERWORLD_ACTIONS,
    LEVEL_P2P_STRUCT
} from "@/newgame/constants/NetworkLevelEvents";

class NetworkLevel {
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
        // in the channels of level change 'm' to 'l'
    	this.subscribe.level.conn = Network.ref.socket.subscribe("l" + levelId);
    	this.subscribe.level.conn.watch(payload => this.dispatchLevelPayload(payload));
        this.subscribe.level.conn.on("subscribe", () => {
            this.subscribe.level.isSubscribed = true;
        });
        this.subscribe.level.conn.on("subscribeFail", () => {
            this.subscribe.level.isSubscribed = false;
            // reiniciar client | dar erro ao client (?)
        });
    }

    unsubscribeLevel (levelId) {
        //levelId = levelId || LevelData.ref.id;
        this.subscribe.level.conn.unsubscribe();
        this.subscribe.level.conn.unwatch();
        this.subscribe.level.isSubscribed = false;
        //Network.ref.socket.unwatch("m" + levelId);
    }

    sendCharacterOverworldAction (direction, actionType) {
        if (!this.subscribe.level.isSubscribed)
            return;
        this.subscribe.level.conn.publish([ direction, actionType ]);
    }

    dispatchLevelPayload (payload) {
        switch (payload[LEVEL_P2P_STRUCT.ACTION_TYPE]) {
            case OVERWORLD_ACTIONS.MOVE:
            case OVERWORLD_ACTIONS.FACING:
            {
                this.scene.$charactersController.handleRemotePlayerData(payload);
                break;
            };
        };
    }
};

export default NetworkLevel;