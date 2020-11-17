import Phaser from "phaser";

import Loader from "./Loader";

class Boot extends Phaser.Scene {
    constructor () {
        super("boot");
    }

    init (params) {
        this.data = params;
    }

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {
        this.scene.start(this.data.state);
    }
};

export default Boot;