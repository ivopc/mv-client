import Phaser from "phaser";

import Layout from "@/newgame/managers/Layout";

class MarketPlace extends Phaser.GameObjects.Container {
    constructor (scene) {
        super(scene);
        this.layout = Layout.ref.data.marketPlace;
        scene.add.existing(this);
    }
};

export default MarketPlace;