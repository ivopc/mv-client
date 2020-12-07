class Network {
    constructor (scene) {
        this.socket = scene.socket;
    }

    send (event, data, callback) {
        this.socket.emit(event, data, callback);
    }

    static ref
};

export default Network;