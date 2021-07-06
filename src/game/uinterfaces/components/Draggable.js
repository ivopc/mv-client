import Phaser from "phaser";

class Draggable extends Phaser.GameObjects.Container {
    constructor (scene) {
        super(scene);
        scene.plugins.get("rexDrag").add(this);
    }

    setDragListeners () {
        this
            .on("dragstart", this.onDragStart, this)
            .on("drag", this.onDragging, this)
            .on("dragend", this.onDragEnd, this);
    }

    onDragStart () {}
    onDragging () {}
    onDragEnd () {}
};

export default Draggable;