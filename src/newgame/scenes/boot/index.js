import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";
import { RESOLUTION } from "@/newgame/constants/Resolutions";

import Loader from "./Loader";

import SceneManager from "@/newgame/managers/SceneManager";
import Database from "@/newgame/managers/Database";
import Assets from "@/newgame/managers/Assets";
import Layout from "@/newgame/managers/Layout";

import {
    CUSTOM_TEMPLATE_LOADER, 
    UI_ASSETS, 
    CHARACTERS,
    MONSTERS,
    LEVELS,
    LAYOUT
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
            ui: this.cache.json.get(UI_ASSETS)
        });
        Layout.ref = new Layout({
            resolution: RESOLUTION.HD,
            data: this.cache.json.get(LAYOUT)
        });
        this.scene.start(this.transitionData.scene);
    }
};

export default Boot;