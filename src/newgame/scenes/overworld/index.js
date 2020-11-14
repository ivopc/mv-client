import Phaser from "phaser";

import PlayerData from "@/newgame/managers/PlayerData";
import MapData from "@/newgame/managers/MapData";

class Overworld extends Phaser.Scene {
    constructor () {
        super("overworld");
    }

    init (params) {

    }

    create () {
        this.scene.launch("map");
    }

    preload () {}
};

export default Overworld;