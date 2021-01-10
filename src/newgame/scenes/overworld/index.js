import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import Loader from "./Loader";

import PlayerData from "@/newgame/managers/PlayerData";
import MapData from "@/newgame/managers/MapData";

class Overworld extends Phaser.Scene {
    constructor () {
        super(SCENE.OVERWORLD);
    }

    init (params) {}

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {
        this.scene.launch(SCENE.MAP);
    }
};

export default Overworld;