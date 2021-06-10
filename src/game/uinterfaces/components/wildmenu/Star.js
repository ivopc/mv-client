import Phaser from "phaser";

import Layout from "@/game/managers/Layout";

class Star extends Phaser.GameObjects.Sprite {
    constructor (scene) {
        super(scene);
        this.layout = Layout.ref.data.wildEncounter;
        this.setTexture(this.layout.ratingStars.spritesheet);
        this.setOrigin(0);
        scene.add.existing(this);
    }

    append (type, { x, y }) {
        this.setPosition(x, y);
        this.setFrame(this.layout.ratingStars.frames[type]);
    }
};

export default Star;