import Phaser from "phaser";

import { SCENE } from "@/game/constants/GameScene";

import SceneManager from "@/game/managers/SceneManager";
import LayoutResponsivityManager from "@/game/managers/LayoutResponsivityManager";

import LoadingUInterface from "./LoadingUInterface";
import Loader from "./Loader";

import WildMenu from "@/game/uinterfaces/WildMenu";

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
        this.plugins.get("rexDrag").add(wild);
    }
};

export default Overworld;