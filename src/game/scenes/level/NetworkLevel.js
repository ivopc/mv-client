import Network from "@/game/managers/Network";
import LevelData from "@/game/managers/LevelData";

import { 
    LEVEL_EVENTS, 
    OVERWORLD_ACTIONS,
    LEVEL_P2P_STRUCT
} from "@/game/constants/NetworkEvents";

import SocketClusterChannel from "@/ws/SocketClusterChannel";

class NetworkLevel {
    constructor (scene) {
        this.scene = scene;
        /**
         * @type {SocketClusterChannel}
         */
        this.levelSubscription;
    }

    addListener () {
        Network.ref
            .addEvent(LEVEL_EVENTS.SEARCH_WILD, data => this.dispatchWild(data))
            .addEvent(LEVEL_EVENTS.CHAT_MESSAGE, data => this.dispatchChatMessage(data));
    }

    removeListener () {
        Object.keys(LEVEL_EVENTS)
            .forEach(event => Network.ref.removeEvent(LEVEL_EVENTS[event]));
    }

    async subscribeLevel (levelId) {
        levelId = levelId || LevelData.ref.id;
        this.levelSubscription = Network.ref.subscribe("l" + levelId);
        this.levelSubscription.addListener(payload => this.dispatchLevelPayload(payload));
        return await this.levelSubscription.awaitSubscription();
    }

    unsubscribeLevel (levelId) {
        this.levelSubscription.destroy();
    }

    sendCharacterOverworldAction (direction, actionType) {
        this.levelSubscription.publish([ direction, actionType ]);
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