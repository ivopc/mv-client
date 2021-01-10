import { ASSET_TYPE } from "@/newgame/constants/Asset";
import ReplaceStringToken from "@/newgame/utils/ReplacePhrase";
import Assets from "@/newgame/managers/Assets";

const AssetTemplateInjector = (assetType, assetData) => {
    switch (assetType) {
        case ASSET_TYPE.MONSTER:
        case ASSET_TYPE.OVERWORLD_MONSTER:
        {
            const template = Assets.ref.template[assetType];
            return {
                key: ReplaceStringToken(template.key, {
                    monsterpediaId: assetData.monsterpediaId
                }),
                path: {
                    texture: ReplaceStringToken(template.path.texture, {
                        monsterpediaId: assetData.monsterpediaId
                    }),
                    atlas: ReplaceStringToken(template.path.atlas, {
                        monsterpediaId: assetData.monsterpediaId
                    })
                }
            };
            break;
        };
        case ASSET_TYPE.CHARACTER_OVERWORLD: {
            const template = Assets.ref.template.characteroverworld;
            return {
                key: ReplaceStringToken(template.key, {
                    name: assetData.name
                }),
                path: {
                    texture: ReplaceStringToken(template.path.texture, {
                        name: assetData.name
                    }),
                    atlas: ReplaceStringToken(template.path.atlas, {
                        name: assetData.name
                    })
                }
            }
            break;
        };
        case ASSET_TYPE.TILEMAP: {
            const template = Assets.ref.template.tilemap;
            return {
                key: ReplaceStringToken(template.key, {
                    name: assetData.id
                }),
                src: ReplaceStringToken(template.src, {
                    name: assetData.name
                })
            };
            break;
        };
        case ASSET_TYPE.LEVEL_SCRIPT: {
            break;
        };
    };
};

export default AssetTemplateInjector;