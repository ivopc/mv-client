import RawLoader from "@/newgame/managers/RawLoader";
import Database from "@/newgame/managers/Database";
import Assets from "@/newgame/managers/Assets";
import PlayerData from "@/newgame/managers/PlayerData";
import MapData from "@/newgame/managers/MapData";
import SceneManager from "@/newgame/managers/SceneManager";

import { loadComplete } from "@/newgame/utils/scene.promisify";

class Loader extends RawLoader {
    fetchAssets () {
        const { scene } = this;
        scene.load.setBaseURL(process.env.gameClientBaseURL);
        // player character sprite
        const playerOverworldSprite = Assets.ref.getOverworldCharacter(PlayerData.ref.character.sprite);
        scene.load.atlas(playerOverworldSprite.key, playerOverworldSprite.path.texture, playerOverworldSprite.path.atlas);
        this.fetchLevel(Database.ref.maps[MapData.ref.id]);
    }

    fetchLevel (map) {
        const { scene } = this;
        // map tilesets
        Assets.ref.getMapTilesets(map.id).forEach(tileset => scene.load.image(tileset.key, tileset.src));
        // map tilemap
        const tilemap = Assets.ref.getMapTilemap(map.id);
        scene.load.tilemapTiledJSON(tilemap.key, tilemap.src);
        // map main music
        const mapMusic = Assets.ref.getMapMainMusic(map.id);
        scene.load.audio(mapMusic.key, mapMusic.src);
        // get all characters from map
        Assets.ref.getMapCharacters(map.id).forEach(character => scene.load.atlas(character.key, character.path.texture, character.path.atlas));
        // wild monsters (if there's)
        if (map.hasWild) 
            map.wildAppearence.forEach(wildId => this.loadMonster(wildId));
        // map custom asset (if there's)
        if (map.customAssets && map.customAssets.length > 0)
            this.fetchLoaders(map.customAssets);
        // load level particular behavior for advanced scripting purpouse
        scene.load.rexAwait(callback =>
            import(`./particularbehavior/${map.id}`)
                .then(behavior => scene.$particularBehavior = new behavior.default(scene))
                .catch(() => scene.$particularBehavior = false)
                .finally(callback)
        );
    }

    async changeLevel (mapData) {
        const loadingInterface = SceneManager.ref.getOverworld().$loadingInterface;
        const { scene } = this;
        loadingInterface.show();
        this.fetchLevel(mapData);
        scene.load.start();
        this.load.on("progress", val => loadingInterface.setProgress(parseInt(val * 100)));
        await loadComplete(scene);
        loadingInterface.hide();
    }
};

export default Loader;