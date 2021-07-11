export const ASSET_TYPE = {
    IMAGE: "image",
    SPRITESHEET: "spritesheet",
    ATLAS: "atlas",
    CHARACTER: "character",
    CHARACTER_OVERWORLD: "characteroverworld",
    MONSTER: "monster",
    MONSTER_OVERWORLD: "monsteroverworld",
    TILEMAP: "tilemap",
    LEVEL_SCRIPT: "levelscript"
};

export const ASSETS_LAZY_LOAD_STRUCTS = {
    [ASSET_TYPE.CHARACTER_OVERWORLD]: {
        assetType: ASSET_TYPE.ATLAS,
        template: ""
    }
};