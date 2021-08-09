import { ASSET_TYPE } from "@/game/constants/Asset";

import ReplaceStringToken from "./ReplaceStringToken";

import Layout from "@/game/managers/Layout";
import Assets from "@/game/managers/Assets";

class AssetTemplateInjector {
    static inject (assetType, assetData) {
        switch (assetType) {
            case ASSET_TYPE.MONSTER: {
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
                };
            };
            case ASSET_TYPE.MONSTER_OVERWORLD: {
                const template = Assets.ref.template.monsteroverworld;
                return {
                    key: ReplaceStringToken.replace(template.key, {
                        monsterpediaId: assetData
                    }),
                    path: {
                        texture: ReplaceStringToken.replace(template.path.texture, {
                            monsterpediaId: assetData
                        }),
                        atlas: ReplaceStringToken.replace(template.path.atlas, {
                            monsterpediaId: assetData
                        })
                    }
                };
            }
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
            };
        };
    }

    static applyResolution (string) {
        return ReplaceStringToken.replace(string, {
            resolution: Layout.ref.resolution
        });
    }
};

export default AssetTemplateInjector;