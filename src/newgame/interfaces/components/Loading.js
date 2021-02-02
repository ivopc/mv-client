import Phaser from "phaser";

class Loading extends Phaser.GameObjects.Sprite {
    constructor (scene) {
        super(scene, 0, 0, "loading");
        this.setScrollFactor(0);
        scene.add.existing(this);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.angle += 1.5;
    }
};

export default Loading;