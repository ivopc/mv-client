import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import Layout from "@/newgame/managers/Layout";
import SceneManager from "@/newgame/managers/SceneManager";

import LoadingUInterface from "./LoadingUInterface";
import Loader from "./Loader";

import WildMenu from "@/newgame/uinterfaces/WildMenu";

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
        const wild = new WildMenu(this);
        wild.append();
    }
};

export default Overworld;