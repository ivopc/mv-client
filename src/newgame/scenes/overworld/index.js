import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import LoadingUInterface from "./LoadingUInterface";
import Loader from "./Loader";

import SceneManager from "@/newgame/managers/SceneManager";

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
        this.scene.launch(SCENE.LEVEL);
        this.scene.bringToTop();
        SceneManager.ref.setOverworld(this);
    }
};

export default Overworld;