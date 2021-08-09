import Draggable from "./Draggable";

class DragglableGridSlot extends Draggable {
    onDragStart () {
        console.log(this.gridSlotIndex);
        this.parentContainer.bringToTop(this);
    }
};

export default DragglableGridSlot;