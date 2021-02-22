import Draggable from "./Draggable";

class DragglableGridElement extends Draggable {
    constructor (scene, gridListData, gridElementIndex) {
        super(scene);
        this.gridListData = gridListData;
        this.gridElementIndex = gridElementIndex;
    }

    onDragEnd () {
        const centerPosition = this.getCenter();
        const elementPosition = { ... {
            x: centerPosition.x,
            y: centerPosition.y
        }};
        for (let i = 0; i < this.gridListData.length; i ++) {
            if (i == this.gridElementIndex)
                continue;
            if (
                elementPosition.x >= this.gridListData[i].basePosition.x && elementPosition.x <= this.gridListData[i].basePosition.x + this.displayWidth &&
                elementPosition.y >= this.gridListData[i].basePosition.y && elementPosition.y <= this.gridListData[i].basePosition.y + this.displayHeight
            )

        };

    }
};

export default DragglableGridElement;