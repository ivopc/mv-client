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
        return AssetTemplateInjector(ASSET_TYPE.CHARACTER_OVERWORLD, character);
    }

    getMapCharacters (id) {
        return Database.ref.maps[id].npcs
            .map(npc => this.getOverworldCharacter(npc.id));
    }

    getMapTilemap (id) {
        const map = Database.ref.maps[id];
        return AssetTemplateInjector(ASSET_TYPE.TILEMAP, map);
    }

    getMapTilesets (id) {
        return Database.ref.maps[id].tiles;
    }

    getMapMainMusic (id) {
        const map = Database.ref.maps[id];
        return {
            key: map.music.name,
            src: "assets/audio/" + map.music.src
        };
    }

    getUiComponent (key) {}

    static ref
};

export default Assets;