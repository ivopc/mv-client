import { fileLoadCompleted } from "./scene.promisify";

import { ASSET_TYPE, ASSETS_LAZY_LOAD_STRUCTS } from "@/game/constants/Asset";

export async function characterLazyLoad (scene, sprite) {
    const characterSprite = Assets.ref.getOverworldCharacter(sprite); // {legacy}
    scene.load.atlas(
        characterSprite.key, 
        characterSprite.path.texture, 
        characterSprite.path.atlas
    );
    scene.load.start();
    await Promise.all([
        watchAssetsLoadEvent(scene, characterSprite.path.texture),
        watchAssetsLoadEvent(scene, characterSprite.path.atlas)
    ]);
};

export async function watchAssetsLoadEvent (scene, assetPath) {
    const fileData = await fileLoadCompleted(scene);
    if (isAssetLoaded(fileData, assetPath)) {
        return fileData;
    } else {
        return await watchAssetsLoadEvent(scene, assetParams);
    };
};

export const isAssetLoaded = (... args) => {
    console.log(... args);
    return true;
}; // {todo}