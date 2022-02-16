// Just for JSDocs Purpouses
import SocketClusterWrapper from "./SocketClusterWrapper";

/**
 * SocketCluster Channel Wrapper
 * @class
 * @param {SocketClusterWrapper} socketWrapper - SocketCluster client wrapper reference
 * @param {String} channelName - Channel that client will subscribe to
 * 
 */
class SocketClusterChannel {
    /** `SCChannel` instance that will listen and send to subscribed channel network events and actions from
     * anothers clients.
     * @type {SCChannel} 
     */
     /*private*/ _channelNetworkHandler;

    constructor (socketWrapper, channelName) {
        /** `SocketClusterWrapper` instance reference.
         * @type {SocketClusterWrapper}
         * @private
         */
        this._socketWrapper = socketWrapper;

        /** The current channel name string, used in `SocketClusterWrapper` into an array to fetch 
         * the channel instance and manipulate them.
         * @type {String}
         */
        this.channelName = channelName;

        /** Is client subscribed to channel?
         * @type {Boolean}
         */
        this.isSubscribed = false;
        this.subscribe(channelName);
    }

    /**
     * Start subscription in channel.
     * @param {string} channelName - The channel name that the user will subscribe.
     * @returns {void}
     */
    subscribe (channelName) {
        this._channelNetworkHandler = this._socketWrapper.initSubscriptionConn(channelName);
    }
    /**
     * Publish data to all clients that's is subscripted on it.
     * @param {any} data - Data to send to others clients that is in channel.
     * @returns {Promise<any>} 
     */
    publish (data) {
        this._channelNetworkHandler.publish(data);
        return;
        // right, we need to treat te response in backend
        return new Promise((resolve, reject) =>
            this._channelNetworkHandler.publish(data, err => err ? reject(err) : resolve())
        );
    }

    /**
     * Listen to the channel subscription events `subscribe` and `subscribeFail`.
     * @returns {Promise<null>} - Just a empty Promise that just return resolve or reject, according to the
     * server response if the user is subscribed or no to the channel.
     */
    awaitSubscription () {
        return new Promise((resolve, reject) => {
            this._channelNetworkHandler.once("subscribe", () => {
                this.isSubscribed = true;
                resolve();
            });
            this._channelNetworkHandler.once("subscribeFail", () => {
                this.isSubscribed = false;
                reject();
            });
        });
    }

    /**
     * Add Function to listen to the other clients actions.
     * @param {Function} fn - A generic Function that is setted to the channel event listener that will watch
     * another clients actions.
     * @returns {void}
     */
    watch (fn) {
        this._channelNetworkHandler.watch(fn);
    }

    /**
     * Remove the listener from channel and unsubscribe in network and clearing the wrapper channels list.
     * @returns {void}  
     */
    destroy () {
        this._channelNetworkHandler.unsubscribe();
        this._channelNetworkHandler.unwatch();
        this.isSubscribed = false;
        // removing me from myself, lol
        const meIndex = this._socketWrapper.channels.findIndex(channel => channel.channelName === this.channelName);
        this._socketWrapper.channels.splice(meIndex, 1);
    }
};

export default SocketClusterChannel;