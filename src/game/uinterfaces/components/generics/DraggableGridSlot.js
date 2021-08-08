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
        this.input.hitArea.setTo(displayWidth / 2, displayHeight / 2, displayWidth, displayHeight);
        this.baseElement.sprite.input.enabled = false;
        this
            .on("pointerdown", () => {
                this.baseElement.sprite.setFrame(1);
            })
            .on("pointerup", () => {
                this.baseElement.sprite.setFrame(0);
            })
            .on("pointerover", () => {
                this.baseElement.sprite.setFrame(2);
            })
            .on("pointerout", () => {
                this.baseElement.sprite.setFrame(0);
            });
        this.setDragListeners();
        //this.scene.input.enableDebug(this);
    }

    setDragListeners () {
        this
            .on("dragstart", this.onDragStart, this)
            .on("drag", this.onDragging, this)
            .on("dragend", this.onDragEnd, this);
    }

    onDragStart () {
        console.log(this.gridSlotIndex);
        this.parentContainer.bringToTop(this);
    }

    onDragging () {}
    
    onDragEnd () {}
};

export default DragglableGridSlot;