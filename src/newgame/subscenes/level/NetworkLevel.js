import Network from "@/newgame/managers/Network";
import LevelData from "@/newgame/managers/LevelData";

import { 
    LEVEL_EVENT, 
    PLAYER_OVERWORLD_ACTIONS 
} from "@/newgame/constants/NetworkLevelEvents";

    /*
        dataType:
        1 = char andando
        2 = char facing
        3 = remover char do mapa
    */

    // nos channels dos level trocar 'm' por 'l' depois

class NetworkLevel {
    constructor (scene) {
        this.scene = scene;
        this.subscribe = {
        	level: {}
        };
    }

    addListener () {
        Network.ref
            .addEvent(LEVEL_EVENT.PONG, () => this.ping())
            .addEvent(LEVEL_EVENT.CHAT_MESSAGE, data => this.newChatMessage(data));

    }

    removeListener () {
        Object.keys(LEVEL_EVENT)
            .forEach(event => Network.ref.removeEvent(LEVEL_EVENT[event]));
    }

    subscribeLevel (levelId) {
        levelId = levelId || LevelData.ref.id;
    	this.subscribe.level.conn = Network.ref.socket.subscribe("m" + levelId);
    	this.subscribe.level.conn.watch(data => this.dispatchLevelData(data));
    }

    unsubscribeLevel (levelId) {
        //levelId = levelId || LevelData.ref.id;
        this.subscribe.level.conn.unsubscribe();
        this.subscribe.level.conn.unwatch();
        //Network.ref.socket.unwatch("m" + levelId);
    }

    sendMove (direction) {
        this.subscribe.level.conn.publish({
            dir: direction,
            dataType: PLAYER_OVERWORLD_ACTIONS.MOVE
        });
    }

    sendFacing (direction) {
        this.subscribe.level.conn.publish({
            dir: direction,
            dataType: PLAYER_OVERWORLD_ACTIONS.FACING
        });
    }
};

export default NetworkLevel;