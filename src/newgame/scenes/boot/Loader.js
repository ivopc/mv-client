import RawLoader from "@/newgame/managers/RawLoader";
import { 
    CUSTOM_TEMPLATE_LOADER, 
    BASE_ASSETS, 
    CHARACTERS, 
    LEVELS,
    MONSTERS
} from "@/newgame/constants/Loader";
class Loader extends RawLoader {
    constructor (scene) {
        super(scene);
        this.scene = scene;
        scene.load.setBaseURL(process.env.gameClientBaseURL);
    }

    fetchAssets () {
        const { scene } = this;
        scene.load.json(BASE_ASSETS, "database/base_assets.json");
        scene.load.json(CUSTOM_TEMPLATE_LOADER, "database/custom_asset_template_loader.json");
        scene.load.json(CHARACTERS, "database/characters.json");
        scene.load.json(MONSTERS, "database/monsters.json");
        scene.load.json(LEVELS, "database/levels.json");
    }
};

export default Loader;