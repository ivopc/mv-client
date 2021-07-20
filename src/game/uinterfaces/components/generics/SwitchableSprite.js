import { GameObjects } from "phaser";

class SwitchableSprite extends GameObjects.Sprite {
    constructor (scene, layout) {
        super(scene);
        this.layout = layout;
        this.setTexture(layout.spritesheet);
        this.setOrigin(0);
    }

    append (frame, { x, y }) {
        this.setPosition(x, y);
        this.setFrame(frame);
        this.scene.add.existing(this);
    }
};

export default SwitchableSprite;