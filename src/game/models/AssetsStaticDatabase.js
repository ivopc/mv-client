import ResourcesDatabaseModel from "./ResourcesDatabaseModel";

import { ASSET_TYPE } from "@/game/constants/Asset";
import { FIELD_TYPES } from "@/game/constants/Battle";

import AssetTemplateInjector from "@/game/utils/AssetTemplateInjector";


class AssetsStaticDatabase {
    static create ({ template, ui }) {
        this.template = template;
        this.ui = ui;
    }

    static getOverworldCharacter (id) {
        const character = ResourcesDatabaseModel.character[id];
        return AssetTemplateInjector.inject(ASSET_TYPE.CHARACTER_OVERWORLD, character);
    }

    static getLevelCharacters (id) {
        return ResourcesDatabaseModel.level[id].npcs
            .map(npc => this.getOverworldCharacter(npc.id));
    }

    static getLevelTilemap (id) {
        const level = ResourcesDatabaseModel.level[id];
        return AssetTemplateInjector.inject(ASSET_TYPE.TILEMAP, level);
    }

    static getLevelScript (id) {
        const level = ResourcesDatabaseModel.level[id];
        return AssetTemplateInjector.inject(ASSET_TYPE.LEVEL_SCRIPT, level);
    }

    static getLevelTilesets (id) {
        return ResourcesDatabaseModel.level[id].tiles;
    }

    static getLevelMainMusic (id) {
        const level = ResourcesDatabaseModel.level[id];
        return {
            key: level.music.name,
            src: "assets/audio/" + level.music.src
        };
    }

    static getBattleField (fieldType) {
        switch (fieldType) {
            case FIELD_TYPES.GRASS: {
                return "battle_grass_background";
            };
        }
    }

    static getBattleFloor (fieldType) {
        switch (fieldType) {
            case FIELD_TYPES.GRASS: {
                return "battle_grass_floor";
            };
        }
    }

    static getUIComponents () {
        return this.ui;
    }
};

export default AssetsStaticDatabase;