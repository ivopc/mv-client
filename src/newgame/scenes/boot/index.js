import Phaser from "phaser";

import Loader from "./Loader";
import Database from "@/newgame/managers/Database";
import Assets from "@/newgame/managers/Assets";

import { 
    CUSTOM_TEMPLATE_LOADER, 
    BASE_ASSETS, 
    CHARACTERS, 
    MAPS 
} from "@/newgame/constants/Loader";

class Boot extends Phaser.Scene {
    constructor () {
        super("boot");
    }

    init (params) {
        this.data = params;
    }

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {
        const getCache = this.cache.json.get;
        Database.ref = new Database({
            maps: getCache(MAPS),
            character: getCache(CHARACTERS)
        });
        Assets.ref = new Assets({
            template: getCache(CUSTOM_TEMPLATE_LOADER),
            base: getCache(BASE_ASSETS)
        });
        this.scene.start(this.data.state);
    }
};

export default Boot;