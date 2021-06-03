class Network {

    constructor (socket) {
        this.socket = socket;
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

    removeEvent (event) {
        this.socket.off(event);
    }

    static ref
};

export default Network;