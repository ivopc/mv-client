import { GameObjects } from "phaser";

import Button from "./Button";

class DragglableGridSlot extends GameObjects.Container {
    constructor (scene, gridListData, gridSlotIndex) {
        super(scene);
        this.gridListData = gridListData;
        this.gridSlotIndex = gridSlotIndex;
        this.isEmpty = true;
    }

    appendBase ( { spritesheet, frames } ) {
        this.baseElement = new Button(this.scene, {
            x: 0, y: 0,
            spritesheet,
            frames
        });
        this.add(this.baseElement);

    }

    setDragglable ( { x, y } ) {
        const { displayWidth, displayHeight } = this.baseElement.sprite;
        this.setSize(displayWidth, displayHeight);
        this.setPosition(x, y);
        this.scene.plugins.get("rexDrag").add(this);
        this.setDragListeners();
    }

    setDragListeners () {
        this
            .on("dragstart", this.onDragStart, this)
            .on("drag", this.onDragging, this)
            .on("dragend", this.onDragEnd, this);
    }

    onDragStart () {
        console.log(this.gridSlotIndex);
    }

    onDragging () {}
    
    onDragEnd () {}
};

export default DragglableGridSlot;