import PlayerData from "./PlayerData";
import Assets from "./Assets";
import Layout from "./Layout";

import MonstersStaticDatabase from "@/game/models/MonstersStaticDatabase";

import { ASSET_TYPE } from "@/game/constants/Asset";

import ReplaceStringToken from "@/game/utils/ReplaceStringToken";
import AssetTemplateInjector from "@/game/utils/AssetTemplateInjector";

class RawLoader {
    constructor (scene) {
        this.scene = scene;
        scene.load.setBaseURL(process.env.gameClientAssetsBaseURL);
        if (!RawLoader.alreadyLoadedBase)
            this.fetchBaseAssets();
    }

    fetchBaseAssets () {
        return;
        const scene = this.scene;
        // load all player monsters
        PlayerData.ref.partyMonsters.forEach(monster => this.loadMonster(monster.monsterpediaId));
        // load ui sprites that we need to use in all scenes
        this.fetchLoaders(Assets.ref.base);
        RawLoader.alreadyLoadedBase = true;
    }

    loadMonster (monsterpediaId) {
        this.fetchLoader({
            type: ASSET_TYPE.MONSTER,
            monsterpediaId
        });
        const overworldSprite = Assets.ref.getOverworlMonster(monsterpediaId);
        this.scene.load.atlas(
            overworldSprite.key, 
            overworldSprite.path.texture, 
            overworldSprite.path.atlas
        );
    }

    fetchLoaders (assets) {
        Object.values(assets).forEach(asset => this.fetchLoader(asset));
    }

    fetchLoader (asset) {
        const scene = this.scene;
        switch (asset.type) {
            case ASSET_TYPE.IMAGE: {
                scene.load.image(asset.key, AssetTemplateInjector.applyResolution(asset.path));
                break;
            };
            case ASSET_TYPE.SPRITESHEET: {
                scene.load.spritesheet(asset.key, AssetTemplateInjector.applyResolution(asset.path), asset.dimensions[Layout.ref.resolution]);
                break;
            };
            case ASSET_TYPE.ATLAS: {
                scene.load.atlas(asset.key, AssetTemplateInjector.applyResolution(asset.path.texture), AssetTemplateInjector.applyResolution(asset.path.atlas));
                break;
            };
            case ASSET_TYPE.MONSTER: {
                const assetData = AssetTemplateInjector.inject(asset.type, asset);
                scene.load.atlas(assetData.key, assetData.path.texture, assetData.path.atlas);
                break;
            };
        }
    }

    // flag to don't need to load base assets again
    static alreadyLoadedBase = false
};

export default RawLoader;