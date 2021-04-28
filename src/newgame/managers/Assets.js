import Database from "./Database";
import { ASSET_TYPE } from "@/newgame/constants/Asset";
import AssetTemplateInjector from "@/newgame/utils/AssetTemplateInjector";

const RESOLUTIONS = {
    FULL_HD: 0,
    HD: 1,
    STANDARD: 2,
    MOBILE: 3
};

class Assets {

    constructor ({ template, base }) {
        this.template = template;
        this.base = base;
    }

    getOverworldCharacter (id) {
        const character = Database.ref.character[id];
        return AssetTemplateInjector.inject(ASSET_TYPE.CHARACTER_OVERWORLD, character);
    }

    getLevelCharacters (id) {
        return Database.ref.maps[id].npcs
            .map(npc => this.getOverworldCharacter(npc.id));
    }

    getLevelTilemap (id) {
        const level = Database.ref.maps[id];
        return AssetTemplateInjector.inject(ASSET_TYPE.TILEMAP, level);
    }

    getLevelScript (id) {
        const level = Database.ref.maps[id];
        return AssetTemplateInjector.inject(ASSET_TYPE.LEVEL_SCRIPT, level);
    }

    getLevelTilesets (id) {
        return Database.ref.maps[id].tiles;
    }

    getLevelMainMusic (id) {
        const level = Database.ref.maps[id];
        return {
            key: level.music.name,
            src: "assets/audio/" + level.music.src
        };
    }

    getUiComponent (key) {}

    static ref
};

export default Assets;