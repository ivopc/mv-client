import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import Loader from "./Loader";

import SceneManager from "@/newgame/managers/SceneManager";
import Database from "@/newgame/managers/Database";
import Assets from "@/newgame/managers/Assets";

import {
    CUSTOM_TEMPLATE_LOADER, 
    BASE_ASSETS, 
    CHARACTERS,
    MONSTERS,
    LEVELS 
} from "@/newgame/constants/Loader";

class Boot extends Phaser.Scene {
    constructor () {
        super(SCENE.BOOT);
    }

    init (params) {
        this.transitionData = params;
    }

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {
        SceneManager.ref = new SceneManager();
        Database.ref = new Database({
            level: this.cache.json.get(LEVELS),
            character: this.cache.json.get(CHARACTERS),
            monster: this.cache.json.get(MONSTERS)
        });
        Assets.ref = new Assets({
            template: this.cache.json.get(CUSTOM_TEMPLATE_LOADER),
            base: this.cache.json.get(BASE_ASSETS)
        });
        this.scene.start(this.transitionData.scene);
    }
};

export default Boot;