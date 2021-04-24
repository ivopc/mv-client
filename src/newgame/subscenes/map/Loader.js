import RawLoader from "@/newgame/managers/RawLoader";
import Database from "@/newgame/managers/Database";
import Assets from "@/newgame/managers/Assets";
import PlayerData from "@/newgame/managers/PlayerData";
import MapData from "@/newgame/managers/MapData";
import SceneManager from "@/newgame/managers/SceneManager";
import BaseLevelScript from "./particularbehavior/BaseLevelScript";

import { loadComplete } from "@/newgame/utils/scene.promisify";

class Loader extends RawLoader {
    fetchAssets () {
        const { scene } = this;
        scene.load.setBaseURL(process.env.gameClientBaseURL);
        // player character sprite
        const playerOverworldSprite = Assets.ref.getOverworldCharacter(PlayerData.ref.character.sprite);
        scene.load.atlas(
            playerOverworldSprite.key, 
            playerOverworldSprite.path.texture, 
            playerOverworldSprite.path.atlas
        );
        this.fetchLevel(Database.ref.maps[MapData.ref.id]);
    }

    fetchLevel (level) {
        const { scene } = this;
        // level tilesets
        Assets.ref.getMapTilesets(level.id).forEach(tileset => scene.load.image(tileset.key, tileset.src));
        // level tilemap
        const tilemap = Assets.ref.getMapTilemap(level.id);
        scene.load.tilemapTiledJSON(tilemap.key, tilemap.src);
        // level script
        const script = Assets.ref.getLevelScript(level.id);
        scene.load.json(script.key, script.src);
        // level main music
        const mapMusic = Assets.ref.getMapMainMusic(level.id);
        scene.load.audio(mapMusic.key, mapMusic.src);
        // get all characters from map
        Assets.ref.getMapCharacters(level.id).forEach(character => scene.load.atlas(character.key, character.path.texture, character.path.atlas));
        // wild monsters (if there's)
        if (level.hasWild) 
            level.wildAppearence.forEach(wildId => this.loadMonster(wildId));
        // level custom asset (if there's)
        if (level.customAssets && level.customAssets.length > 0)
            this.fetchLoaders(level.customAssets);
        // load level particular behavior for advanced scripting purpouse
        scene.load.rexAwait(callback =>
            import(`./particularbehavior/${level.id}`)
                .then(behavior => scene.$levelBehavior = new behavior.default(scene))
                .catch(() => scene.$levelBehavior = new BaseLevelScript(scene))
                .finally(callback)
        );
    }

    async changeLevel (levelData) {
        const loadingInterface = SceneManager.ref.getOverworld().$loadingInterface;
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