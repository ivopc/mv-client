class GenericOverworldMovable {

    constructor () {
        this.events = {
            startMove: [],
            endMove: [],
            cantMove: []
        };
        this.grassOverlay;
    }

    onStartMove (callback) {
        this.events.startMove.push(callback);
    }

    onEndMove (callback) {
        this.events.endMove.push(callback);
    }

    onCantMove (callback) {
        this.events.cantMove.push(callback);
    }

    triggerStartMove (position) {
        this.events.startMove.forEach(fn => fn(position));
    }

    triggerEndMove (position) {
        this.events.endMove.forEach(fn => fn(position));
    }

    triggerCantMove (position) {
        this.events.cantMove.forEach(fn => fn(position));
    }

    addInteraction (fn) {
        this.setInteractive().on("pointerdown", fn);
    }

    addGrassOverlay () {}

    removeGrassOverlay () {}

    collide () {}

    move () {}

    face () {}
};

export default GenericOverworldMovable;