import Network from "@/newgame/managers/Network";

class NetworkMap {
    constructor (scene) {
        this.scene = scene;
    }

    listen () {
    	Network.ref
    		.on(EVENTS.PONG, () => this.ping())
    		.on(EVENTS.CHAT_MESSAGE, data => this.newChatMessage(data));
    }

};

export default NetworkMap;