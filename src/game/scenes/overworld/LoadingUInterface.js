import Phaser from "phaser";

class LoadingUInterface extends Phaser.GameObjects.Container {
    constructor (scene) {
        super(scene);
        this.scene = scene;
    }
};

export default LoadingUInterface;