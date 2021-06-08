import socketCluster from "socketcluster-client";
import scCodecMinBin from "sc-codec-min-bin";

import SocketClusterChannel from "./SocketClusterChannel";

/**
 * @typedef {{userId: String, token: String}} Auth 
 */

/**
 * SocketCluster client Wrapper that automatize the events to make possible
 * work with another frameworks without a lot of changes.
 * @class
 */
class SocketClusterWrapper {

    /**
     * @type {Auth} - The auth object of client containing user id and auth token.
     */
    /*public*/ auth;

    /** Raw `SCClientSocket` socket object, please, avoid to use it in another classes.
     * @private
     * @type {SCClientSocket}
     */
    /*private*/ _socket;
    
    /**
     * @type {SocketClusterChannel[]}
     * All channels inside of a list
     */
    /*public*/ channels = [];

    /**
     * Credentials data setter
     * @param {Auth} authData 
     * @returns {void}
     */
    setAuth (authData) {
        this.auth = authData;
    }

    /**
     * Start the websocket connection with config and may codec driver. There's no way that case...
     * Unfortunately we need to use the socket framework API directly.
        * @returns {void}
     */
    startConn () {
        this._socket = socketCluster.connect({
            query: this.auth,
            ... process.env.gameClientNetwork,
            ... this.codec
        });
    }

    /**
     * Await connection from server and auth response. Of course this happens only one time,
     * because it is `SCClientSocket.once` in the raw API.
     * @async
     * 
     */
    async waitConn () {
        await this.waitOnceEvent("connect");
    }

    /**
     * HTTP-like Data Emitter to websocket server, cause you can wait for response without depending on
     * event listener in client-side, just using Promises to get the response.
     * @param {number|string} event - Event name.
     * @param {any} data - Event params.
     * @returns {Promise}
     */
    send (event, data) {
        return new Promise((resolve, reject) =>
            this._socket.emit(
                event, 
                data, 
                (err, response) => err ? reject(err) : resolve(response)
            )
        );
    }

    /**
     * Add server-to-client event listener.
     * @param {number|string} event - Event name.
     * @param {Function} fn - Generic `Function` to listen to the event name.
     * @returns {this}
     */
    addEvent (event, fn) {
        this._socket.on(event, fn);
        return this;
    }

    /**
     * Listen to the event just one time, for an example we can use it in `connect` event
     * cause this happens only once, so we can works with `Promise` here :) because is only 
     * one event.
     * @param {number|string} event Event name.
     * @returns {Promise}
     */
    waitOnceEvent (event) {
        return new Promise(resolve => this._socket.once(event, resolve));
    }

    /**
     * Remove Event from client-to-server
     * @param {number} event
     * @returns {void} 
     */
    removeEvent (event) {
        this._socket.off(event);
    }

    /**
     * Subscribe to channel, for peer2peer operations purpouses and instantiate `SocketClusterChannel` class
     * using factory.
     * @param {string} channelName 
     * @returns {SocketClusterChannel}
     */
    subscribe (channelName) {
        /** Instantiate
         * @type {SocketClusterChannel}
         */
        const scChannel = new SocketClusterChannel(this, channelName);
        this.channels.push(scChannel);
        return scChannel;
    }

    /** Just a method to avoid the `SocketClusterChannel` class to use the raw socket API directly. It starts
     * the channel subscription sending the sub request data.
     * @param {string} channelName
     * @returns {SCChannel}
     */
    initSubscriptionConn (channelName) {
        return this._socket.subscribe(channelName);
    }

    /** Get the codec configs, we send an empty object in development env 
     * cause dev don't need to be secure or economize network bandwith in that 
     * way, only in production
     * @private
     * @returns {any}
     */
    get _codec () {
        return process.env.NODE_ENV == "development" ? 
        {} : {
            codecEngine: scCodecMinBin
        }; 
    }
};

export default SocketClusterWrapper;