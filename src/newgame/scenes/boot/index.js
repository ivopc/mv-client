import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import Loader from "./Loader";
import Database from "@/newgame/managers/Database";
import Assets from "@/newgame/managers/Assets";

import {
    CUSTOM_TEMPLATE_LOADER, 
    BASE_ASSETS, 
    CHARACTERS,
    MONSTERS,
    MAPS 
} from "@/newgame/constants/Loader";

class Boot extends Phaser.Scene {
    constructor () {
        super(SCENE.BOOT);
    }

    init (params) {
        this.data = params;
    }

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {
        Database.ref = new Database({
            maps: this.cache.json.get(MAPS),
            character: this.cache.json.get(CHARACTERS),
            monsters: this.cache.json.get(MONSTERS)
        });
        Assets.ref = new Assets({
            template: this.cache.json.get(CUSTOM_TEMPLATE_LOADER),
            base: this.cache.json.get(BASE_ASSETS)
        });
        console.log("scene", this.data.scene);
        this.scene.start(this.data.scene);
    }
};

export default Boot;