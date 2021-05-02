class Network {

    constructor (socket) {
        this.socket = socket;
    }

    send (event, data, callback = () => {}) {
        this.socket.emit(event, data, callback);
    }

    addEvent (event, fn) {
        this.socket.on(event, fn);
        return this;
    }

    removeEvent (event) {
        this.socket.off(event);
    }

    static ref
};

export default Network;