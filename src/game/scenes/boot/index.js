import { Scene } from "phaser";

import { SCENE } from "@/game/constants/GameScene";
import { RESOLUTION_TYPES } from "@/game/constants/Resolutions";

import Loader from "./Loader";

import Database from "@/game/managers/Database";
import Assets from "@/game/managers/Assets";
import Layout from "@/game/managers/Layout";

import ResourcesDatabaseModel from "@/game/models/ResourcesDatabaseModel";
import AssetsStaticDatabase from "@/game/models/AssetsStaticDatabase";
import TextStaticDatabase from "@/game/models/TextStaticDatabase";

import MonstersStaticDatabase from "@/game/models/MonstersStaticDatabase";
import MovesStaticDatabase from "@/game/models/MovesStaticDatabase";

import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";

import {
    CUSTOM_TEMPLATE_LOADER, 
    UI_ASSETS, 
    CHARACTERS,
    MONSTERS,
    MONSTER_EXP,
    MONSTER_MOVES,
    LEVELS,
    LAYOUT,
    TEXTS
} from "@/game/constants/Loader";

class Boot extends Scene {
    constructor () {
        super({ key: SCENE.BOOT });
    }

    init (params) {
        this.transitionData = params;
    }

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {
        Database.ref = new Database({
            level: this.cache.json.get(LEVELS),
            character: this.cache.json.get(CHARACTERS),
            monster: this.cache.json.get(MONSTERS),
            monstersExp: this.cache.json.get(MONSTER_EXP)
        }); // {legacy}
        ResourcesDatabaseModel.create({
            level: this.cache.json.get(LEVELS),
            character: this.cache.json.get(CHARACTERS),
            monster: this.cache.json.get(MONSTERS),
            monstersExp: this.cache.json.get(MONSTER_EXP)
        });
        MonstersStaticDatabase.create(this.cache.json.get(MONSTERS));
        MovesStaticDatabase.create(this.cache.json.get(MONSTER_MOVES));
        TextStaticDatabase.create(this.cache.json.get(TEXTS));
        Assets.ref = new Assets({
            template: this.cache.json.get(CUSTOM_TEMPLATE_LOADER),
            ui: this.cache.json.get(UI_ASSETS)
        }); // {legacy}
        AssetsStaticDatabase.create({
            template: this.cache.json.get(CUSTOM_TEMPLATE_LOADER),
            ui: this.cache.json.get(UI_ASSETS)
        });
        Layout.ref = new Layout({
            resolution: RESOLUTION_TYPES.HD,  // {placeholder}
            data: this.cache.json.get(LAYOUT)
        }); // {legacy}
        LayoutStaticDatabase.create({
            resolution: RESOLUTION_TYPES.HD, // {placeholder}
            data: this.cache.json.get(LAYOUT)
        });
        this.scene.start(this.transitionData.scene);
    }
};

export default Boot;