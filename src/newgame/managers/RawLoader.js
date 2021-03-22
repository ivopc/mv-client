import PlayerData from "./PlayerData";
import Assets from "./Assets";

import { ASSET_TYPE } from "@/newgame/constants/Asset";
import ReplaceStringToken from "@/newgame/utils/ReplaceStringToken";
import AssetTemplateInjector from "@/newgame/utils/AssetTemplateInjector";

const RESOLUTION = "fullhd";

class RawLoader {
    constructor (scene) {
        this.scene = scene;
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

        this.fetchLoader({
            type: ASSET_TYPE.MONSTER_OVERWORLD,
            monsterpediaId
        });
    }

    fetchLoaders (assets) {
        Object.keys(assets).forEach(asset => this.fetchLoader(assets[asset]));
    }

    fetchLoader (asset) {
        const scene = this.scene;
        switch (asset.type) {
            case ASSET_TYPE.IMAGE: {
                scene.load.image(asset.key, this.applyResolution(asset.path));
                break;
            };

            case ASSET_TYPE.SPRITESHEET: {
                scene.load.spritesheet(asset.key, this.applyResolution(asset.path), asset.dimensions[RESOLUTION]);
                break;
            };

            case ASSET_TYPE.ATLAS: {
                scene.load.atlas(asset.key, this.applyResolution(asset.path.texture), this.applyResolution(asset.path.atlas));
                break;
            };

            case ASSET_TYPE.MONSTER:
            case ASSET_TYPE.OVERWORLD_MONSTER:
            {
                const assetData = AssetTemplateInjector(asset.type, asset);
                scene.load.atlas(assetData.key, assetData.path.texture, assetData.path.atlas);
                break;
            };
        }
    }

    applyResolution (path) {
        return ReplaceStringToken.replace(path, RESOLUTION);
    }

    // static flag to don't need to load base assets again
    static alreadyLoadedBase = false
};

export default RawLoader;