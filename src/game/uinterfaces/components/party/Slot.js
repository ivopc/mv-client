import DraggableGridSlot from "../generics/DraggableGridSlot";

class Slot extends DraggableGridSlot {
    constructor (scene, gridListData, gridSlotIndex) {
        super(scene, gridListData, gridSlotIndex);
        scene.add.existing(this);
    }
};

export default Slot;