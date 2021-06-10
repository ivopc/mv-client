import Database from "./Database";
import { ASSET_TYPE } from "@/game/constants/Asset";
import AssetTemplateInjector from "@/game/utils/AssetTemplateInjector";

class Assets {

    constructor ({ template, ui }) {
        this.template = template;
        this.ui = ui;
    }

    getOverworldCharacter (id) {
        const character = Database.ref.character[id];
        return AssetTemplateInjector.inject(ASSET_TYPE.CHARACTER_OVERWORLD, character);
    }

    getLevelCharacters (id) {
        return Database.ref.level[id].npcs
            .map(npc => this.getOverworldCharacter(npc.id));
    }

    getLevelTilemap (id) {
        const level = Database.ref.level[id];
        return AssetTemplateInjector.inject(ASSET_TYPE.TILEMAP, level);
    }

    getLevelScript (id) {
        const level = Database.ref.level[id];
        return AssetTemplateInjector.inject(ASSET_TYPE.LEVEL_SCRIPT, level);
    }

    getLevelTilesets (id) {
        return Database.ref.level[id].tiles;
    }

    getLevelMainMusic (id) {
        const level = Database.ref.level[id];
        return {
            key: level.music.name,
            src: "assets/audio/" + level.music.src
        };
    }

    getUIComponents () {
        return this.ui;
    }

    static ref
};

export default Assets;