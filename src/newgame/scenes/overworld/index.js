import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import LoadingUInterface from "./LoadingUInterface";
import Loader from "./Loader";

import SceneManager from "@/newgame/managers/SceneManager";
import PlayerData from "@/newgame/managers/PlayerData";
import MapData from "@/newgame/managers/MapData";

class Overworld extends Phaser.Scene {
    constructor () {
        super(SCENE.OVERWORLD);
    }

    init (params) {}

    preload () {
        this.$loadingInterface = new LoadingUInterface(this);
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {
        this.scene.launch(SCENE.MAP);
        SceneManager.ref.setOverworld(this);
    }
};

export default Overworld;