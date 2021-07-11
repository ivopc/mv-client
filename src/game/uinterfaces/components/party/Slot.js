import DraggableGridSlot from "../generics/DraggableGridSlot";

class Slot extends DraggableGridSlot {
    constructor (scene, gridListData, gridSlotIndex) {
        super(scene, gridListData, gridSlotIndex);
        scene.add.existing(this);
    }

    add (children) {
        super.add(children);
    }
};

export default Slot;