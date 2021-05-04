import Phaser from "phaser";

class DragglableGridSlot extends Phaser.GameObjects.Container {
    constructor (scene, gridListData, gridSlotIndex) {
        super(scene);
        this.gridListData = gridListData;
        this.gridSlotIndex = gridSlotIndex;
        this.isEmpty = true;
    }
};

export default DragglableGridSlot;