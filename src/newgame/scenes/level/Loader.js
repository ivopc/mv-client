import RawLoader from "@/newgame/managers/RawLoader";
import Database from "@/newgame/managers/Database";
import Assets from "@/newgame/managers/Assets";
import PlayerData from "@/newgame/managers/PlayerData";
import LevelData from "@/newgame/managers/LevelData";
import SceneManager from "@/newgame/managers/SceneManager";
import BaseLevelScript from "./particularbehavior/BaseLevelScript";

import { loadComplete } from "@/newgame/utils/scene.promisify";

class Loader extends RawLoader {
    fetchAssets () {
        const { scene } = this;
        // player character sprite
        const playerOverworldSprite = Assets.ref.getOverworldCharacter(PlayerData.ref.character.sprite);
        scene.load.atlas(
            playerOverworldSprite.key, 
            playerOverworldSprite.path.texture, 
            playerOverworldSprite.path.atlas
        );
        this.fetchLevel(Database.ref.level[LevelData.ref.id]);
    }

    fetchLevel (level) {
        const { scene } = this;
        // level tilesets
        Assets.ref.getLevelTilesets(level.id).forEach(tileset => scene.load.image(tileset.key, tileset.src));
        // level tilemap
        const tilemap = Assets.ref.getLevelTilemap(level.id);
        scene.load.tilemapTiledJSON(tilemap.key, tilemap.src);
        // level script
        const script = Assets.ref.getLevelScript(level.id);
        scene.load.json(script.key, script.src);
        // level main music
        const levelMusic = Assets.ref.getLevelMainMusic(level.id);
        scene.load.audio(levelMusic.key, levelMusic.src);
        // get all characters from level
        Assets.ref.getLevelCharacters(level.id).forEach(character => scene.load.atlas(character.key, character.path.texture, character.path.atlas));
        // wild monsters (if there's)
        if (level.hasWild) 
            level.wildAppearence.forEach(wildId => this.loadMonster(wildId));
        // level custom asset (if there's)
        if (level.customAssets && level.customAssets.length > 0)
            this.fetchLoaders(level.customAssets);
        // subscribe to level in network and load level particular
        //  behavior for advanced scripting (if there's)
        scene.load.rexAwait(async callback => {
            const promises = [
                async () => await scene.$network.subscribeLevel(level.id)
            ];
            if (level.hasParticularBehavior) {
                promises.push(async () => await import(`./particularbehavior/${level.id}`));
            };
            const [ subscription, levelBehavior ] = await Promise.all(promises.map(fn => fn()));
            if (level.hasParticularBehavior)
                scene.$levelBehavior = new levelBehavior.default(scene);
            else
                scene.$levelBehavior = new BaseLevelScript(scene);
            callback();
        });

    }

    async changeLevel (levelData) {
        const loadingInterface = SceneManager.getOverworld().$loadingInterface;
        const { scene } = this;
        //loadingInterface.show();
        this.fetchLevel(levelData);
        scene.load.start();
        //scene.load.on("progress", val => loadingInterface.setProgress(parseInt(val * 100)));
        await loadComplete(scene);
        //loadingInterface.hide();
    }
};

export default Loader;