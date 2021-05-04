import Phaser from "phaser";

class DraggableGridContainer extends Phaser.GameObjects.Container {
    constructor (scene, x, y, children, gridListData) {
        super(scene, x, y, children, gridListData);
        this.scene = scene;
        this.gridListData = gridListData;
    }


};


c = {
    slots: [
        {
            isEmpty: true,
            position: {
                x: 0,
                y: 0
            }
        }
    ]
}

export default DraggableGridContainer;