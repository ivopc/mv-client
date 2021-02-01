class Network {

    constructor (socket) {
        this.socket = socket;
    }

    send (event, data, callback) {
        this.socket.emit(event, data, callback);
    }

    on (event, fn) {
        this.socket.on(event, fn);
        return this.socket;
    }

    static ref
};

export default Network;