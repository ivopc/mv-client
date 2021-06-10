import { GAME_EVENTS } from "@/game/constants/NetworkEvents";

import { getSocketWrapper } from "@/ws";

class Network extends getSocketWrapper() {

    async getGameBootData () {
        let bootData;
        try {
            bootData = await this.waitOnceEvent(GAME_EVENTS.GAME_CLIENT_BOOT);
        } catch (err) {
            // call gameclient get initial data connection error
        };
        return bootData;
    }

    /**
     * Static reference to self (`Network`) object, to use in all game application
     * @static
     * @type {Network}
     */
     static ref
};

export default Network;