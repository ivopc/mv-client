import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import SceneManager from "@/newgame/managers/SceneManager";
import LayoutResponsivityManager from "@/newgame/managers/LayoutResponsivityManager";

import LoadingUInterface from "./LoadingUInterface";
import Loader from "./Loader";

import WildMenu from "@/newgame/uinterfaces/WildMenu";

class Overworld extends Phaser.Scene {
    constructor () {
        super({ key: SCENE.OVERWORLD });
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
        SceneManager.setOverworld(this);
        LayoutResponsivityManager.addListener();
        // tests
        const wild = new WildMenu(this);
        wild.append();
        window.wild = wild;
    }
};

export default Overworld;