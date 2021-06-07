import { GAME_EVENTS } from "@/newgame/constants/NetworkEvents";
import scCodecMinBin from "sc-codec-min-bin";
class Network {

    constructor (socketBuilderWrapper) {
        this.socketBuilderWrapper = socketBuilderWrapper;
        this.socket;
        this.auth;
    }

    setAuth (data) {
        this.auth = data;
    }

    startConn () {
        this.socket = this.socketBuilderWrapper.connect({
            query: this.auth,
            ... process.env.gameClientNetwork,
            ... this.codec
        });
    }

    async waitConn () {
        await this.waitOnceEvent("connect");
    }

    async getGameBootData () {
        let bootData;
        try {
            bootData = await this.waitOnceEvent(GAME_EVENTS.GAME_CLIENT_BOOT);
        } catch (err) {
            // call gameclient auth connection error
        };
        return bootData;
    }

    send (event, data) {
        return new Promise((resolve, reject) =>
            this.socket.emit(
                event, 
                data, 
                (err, response) => err ? reject(err) : resolve(response)
            )
        );
    }

    addEvent (event, fn) {
        this.socket.on(event, fn);
        return this;
    }

    waitOnceEvent (event) {
        return new Promise((resolve, reject) => this.socket.once(event, resolve));
    }

    removeEvent (event) {
        this.socket.off(event);
    }

    get codec () {
        // we send empty object in development env cause dev don't need to be secure or
        // economize network bandwith
        return process.env.NODE_ENV !== "development" ? 
        {} : {
            codecEngine: scCodecMinBin
        }; 
    }

    static isFirstConnection = true

    static ref
};

export default Network;