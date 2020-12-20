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
        const getFromCache = this.cache.json.get;
        Database.ref = new Database({
            maps: getFromCache(MAPS),
            character: getFromCache(CHARACTERS)
        });
        Assets.ref = new Assets({
            template: getFromCache(CUSTOM_TEMPLATE_LOADER),
            base: getFromCache(BASE_ASSETS)
        });
        this.scene.start(this.data.state);
    }
};

export default Boot;