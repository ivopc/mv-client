import { ASSET_TYPE } from "@/newgame/constants/Asset";
import ReplaceStringToken from "@/newgame/utils/ReplaceStringToken";
import Assets from "@/newgame/managers/Assets";

class AssetTemplateInjector {
    static inject (assetType, assetData) {
        switch (assetType) {
            case ASSET_TYPE.MONSTER:
            case ASSET_TYPE.OVERWORLD_MONSTER:
            {
                const template = Assets.ref.template[assetType];
                return {
                    key: ReplaceStringToken.replace(template.key, {
                        monsterpediaId: assetData.monsterpediaId
                    }),
                    path: {
                        texture: ReplaceStringToken.replace(template.path.texture, {
                            monsterpediaId: assetData.monsterpediaId
                        }),
                        atlas: ReplaceStringToken.replace(template.path.atlas, {
                            monsterpediaId: assetData.monsterpediaId
                        })
                    }
                };
                break;
            };
            case ASSET_TYPE.CHARACTER_OVERWORLD: {
                const template = Assets.ref.template.characteroverworld;
                return {
                    key: ReplaceStringToken.replace(template.key, {
                        name: assetData.name
                    }),
                    path: {
                        texture: ReplaceStringToken.replace(template.path.texture, {
                            name: assetData.name
                        }),
                        atlas: ReplaceStringToken.replace(template.path.atlas, {
                            name: assetData.name
                        })
                    }
                }
                break;
            };
            case ASSET_TYPE.TILEMAP: {
                const template = Assets.ref.template.tilemap;
                return {
                    key: ReplaceStringToken.replace(template.key, {
                        name: assetData.id
                    }),
                    src: ReplaceStringToken.replace(template.src, {
                        name: assetData.name
                    })
                };
                break;
            };
            case ASSET_TYPE.LEVEL_SCRIPT: {
                const template = Assets.ref.template.levelscript;
                return {
                    key: ReplaceStringToken.replace(template.key, {
                        name: assetData.id
                    }),
                    src: ReplaceStringToken.replace(template.src, {
                        name: assetData.name
                    })
                }
                break;
            };
        };
    }
};

export default AssetTemplateInjector;