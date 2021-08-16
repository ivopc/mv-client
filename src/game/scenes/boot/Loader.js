import RawLoader from "@/game/managers/RawLoader";

import { 
    CUSTOM_TEMPLATE_LOADER, 
    UI_ASSETS, 
    CHARACTERS, 
    LEVELS,
    MONSTERS,
    MONSTER_EXP,
    LAYOUT,
    TEXTS
} from "@/game/constants/Loader";

class Loader extends RawLoader {
    fetchAssets () {
        const { scene } = this;
        scene.load.json(UI_ASSETS, "database/ui_assets.json");
        scene.load.json(CUSTOM_TEMPLATE_LOADER, "database/custom_asset_template_loader.json");
        scene.load.json(CHARACTERS, "database/characters.json");
        scene.load.json(MONSTERS, "database/monsters.json");
        scene.load.json(MONSTER_EXP, "database/experience.json");
        scene.load.json(LEVELS, "database/levels.json");
        scene.load.json(LAYOUT, "assets/resources/layout_hd.json"); // {placeholder}
        scene.load.json(TEXTS, "database/texts.json");
    }
};

export default Loader;