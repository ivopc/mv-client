import Draggable from "./Draggable";

export default class DragglableGridSlot extends Draggable {
    onDragStart () {
        console.log(this.gridSlotIndex);
        this.parentContainer.bringToTop(this);
    }
};