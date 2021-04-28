import Network from "@/newgame/managers/Network";

class NetworkLevel {
    constructor (scene) {
        this.scene = scene;
        this.subscribe = {
        	level: {}
        };
    }

    listen () {
        Network.ref
            .addEvent(EVENTS.PONG, () => this.ping())
            .addEvent(EVENTS.CHAT_MESSAGE, data => this.newChatMessage(data));
    }

    listenToCurrentLevel (levelId) {
    	// trocar 'm' por 'l' depois
    	this.subscribe.level.conn = Network.ref.socket.subscribe("m" + levelId);
    	this.subscribe.level.conn.watch(data => this.dispatchLevelData(data));
    }
};

export default NetworkLevel;