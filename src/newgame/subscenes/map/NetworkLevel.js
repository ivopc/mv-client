import Network from "@/newgame/managers/Network";

class NetworkLevel {
    constructor (scene) {
        this.scene = scene;
    }

    listen () {
        Network.ref
            .addEvent(EVENTS.PONG, () => this.ping())
            .addEvent(EVENTS.CHAT_MESSAGE, data => this.newChatMessage(data));
    }

    listenToCurrentLevel () {}
};

export default NetworkLevel;