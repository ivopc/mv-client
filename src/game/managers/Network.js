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
     * Static method to send 'ajax' req. to gameserver avoiding `ref` static attr. boilerplate
     * @static
     * @param {number|string} event 
     * @param {JSON} data
     * @async 
     * @returns {JSON}
     */
    static async ajax (event, data) {
        return Network.ref.ajax(event, data);
    }

    /**
     * Static reference to self (`Network`) object, to use in all game application
     * @static
     * @type {Network}
     */
     static ref
};

export default Network;