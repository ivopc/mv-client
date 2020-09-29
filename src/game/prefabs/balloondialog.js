import Phaser from "phaser";

class BalloonDialog extends Phaser.GameObjects.Sprite {
    constructor (scene) {
        super(scene);

        this.setTexture("chat-balloon");
        //this.setFrame(2);
        //this.setScrollFactor(0);

        scene.anims.create({
            key: "balloon_chating",
            frames: scene.anims.generateFrameNumbers("chat-balloon"),
            frameRate: 2,
            repeat: -1
        });

        this.anims.load("balloon_chating");
        this.anims.play("balloon_chating");

        scene.add.existing(this);
    }
};


export default BalloonDialog;