import { io } from "socket.io-client";

class SocketIOWrapper {
    constructor () {
        this._socket;
        this.auth;
        this.channel;
    }

    setAuth (authData) {
        this.auth = authData;
    }

    startConn () {
        this._socket = io({
            ... { auth: this.auth },
            // binary 'codec' for production
            ... {
                forceBase64: process.env.NODE_ENV !== "development",
                path: process.env.gameClientNetwork.path
            }
        });
    }
 
    async waitConn () {
        await this.waitOnceEvent("connect");
    }

    send () {
        return new Promise((resolve, reject) =>
            this._socket.emit(
                event, 
                data, 
                (err, response) => err ? reject(err) : resolve(response)
            )
        );
    }

    addEvent () {
        this._socket.on(event, fn);
        return this;
    }

    waitOnceEvent () {
        return new Promise((resolve, reject) => this._socket.once(event, resolve));
    }

    removeEvent () {
        this._socket.off(event);
    }

    get _codec () {
        // we send empty object in development env cause dev don't 
        // need to be secure or economize network bandwith
        return process.env.NODE_ENV == "development" ? 
        {} : {
            codecEngine: scCodecMinBin
        }; 
    }
};

export default SocketIOWrapper;