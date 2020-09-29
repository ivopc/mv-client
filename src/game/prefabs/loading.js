import Phaser from "phaser";

class Loading extends Phaser.GameObjects.Sprite {
    constructor (scene) {
        let pos;

        if (scene.isMobile) {
            pos = {
                x: 39,
                y: 39
            };
        } else {
            pos = {
                x: 441,
                y: 201
            }
        };
        super(scene, pos.x, pos.y, "loading");
        this.setScrollFactor(0);
        scene.add.existing(this);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.angle += 1.5;
    }
};

export default Loading;