class Network {

    constructor (socket) {
        this.socket = socket;
    }

    send (event, data, callback) {
        this.socket.emit(event, data, callback);
    }

    static ref
};

export default Network;