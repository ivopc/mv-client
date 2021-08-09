import { GameObjects } from "phaser";
import { addGenericUIComponent } from "@/game/utils";

class Draggable extends GameObjects.Container {

    constructor (scene, gridListData, gridSlotIndex) {
        super(scene);
        this.gridListData = gridListData;
        this.gridSlotIndex = gridSlotIndex;
        this.isEmpty = true;
    }

    /**
     * Add the base sprite
     * @method
     */
     appendBase ( { spritesheet, frames } ) {
        this.base = addGenericUIComponent({
            name: "slot",
            position: {
                x: 0,
                y: 0
            },
            texture: spritesheet
        }, this.scene).setData({
            inputClick: frames.click,
            inputOver: frames.over,
            inputUp: frames.up,
            inputOut: frames.out
        });
        this.add(this.base);
    }

    setupBaseSprite ( { x, y } ) {
        const { displayWidth, displayHeight } = this.base;
        this.setSize(displayWidth, displayHeight);
        this.setPosition(x, y);
        this.scene.plugins.get("rexDrag").add(this);
        this.input.hitArea.setTo(displayWidth / 2, displayHeight / 2, displayWidth, displayHeight);
        this
            .on("pointerdown", () => {
                this.base.setFrame(this.base.getData("inputClick"));
            })
            .on("pointerup", () => {
                this.base.setFrame(this.base.getData("inputUp"));
            })
            .on("pointerover", () => {
                this.base.setFrame(this.base.getData("inputOver"));
            })
            .on("pointerout", () => {
                this.base.setFrame(this.base.getData("inputOut"));
            });
    }

    setDragListeners () {
        this.scene.plugins.get("rexDrag").add(this);
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