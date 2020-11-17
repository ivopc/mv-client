import Phaser from "phaser";

import Loader from "./Loader";

import PlayerData from "@/newgame/managers/PlayerData";
import MapData from "@/newgame/managers/MapData";
class Overworld extends Phaser.Scene {
    constructor () {
        super("overworld");
    }

    init (params) {}

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {
        this.scene.launch("map");
    }
};

export default Overworld;