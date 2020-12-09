import { ASSET_TYPE } from "@/newgame/constants/Asset";
import ReplacePhrase from "@/newgame/utils/ReplacePhrase";
import Assets from "@/newgame/managers/Assets";

const AssetTemplateInjector = (assetType, assetData) => {
    switch (assetType) {
        case ASSET_TYPE.MONSTER:
        case ASSET_TYPE.OVERWORLD_MONSTER:
        {
            const template = Assets.ref.template[assetType];
            return {
                key: ReplacePhrase(template.key, {
                    monsterpediaId: assetData.monsterpediaId
                }),
                path: {
                    texture: ReplacePhrase(template.path.texture, {
                        monsterpediaId: assetData.monsterpediaId
                    }),
                    atlas: ReplacePhrase(template.path.atlas, {
                        monsterpediaId: assetData.monsterpediaId
                    })
                }
            };
            break;
        };

        case ASSET_TYPE.CHARACTER_OVERWORLD: {
            const template = Asssets.ref.template.characteroverworld;
            return {
                key: ReplacePhrase(template.key, {
                    name: assetData.name
                }),
                path: {
                    texture: ReplacePhrase(template.path.texture, {
                        name: assetData.name
                    }),
                    atlas: ReplacePhrase(template.path.atlas, {
                        name: assetData.name
                    })
                }
            }
            break;
        };
    }
};

export default AssetTemplateInjector;