import RawLoader from "@/newgame/managers/RawLoader";

import Database from "@/newgame/managers/Database";
import Assets from "@/newgame/managers/Assets";

import PlayerData from "@/newgame/managers/PlayerData";
import MapData from "@/newgame/managers/MapData";

class Loader extends RawLoader {
    fetchAssets () {
        const scene = this.scene;
        scene.load.setBaseURL(process.env.gameClientBaseURL);
        // player character sprite
        const playerOverworldSprite = Assets.ref.getOverworldCharacter(PlayerData.ref.character.sprite);
        scene.load.atlas(playerOverworldSprite.key, playerOverworldSprite.path.texture, playerOverworldSprite.path.atlas);
        const map = Database.ref.maps[MapData.ref.id];
        // map tilesets
        Assets.ref.getMapTilesets(map.id).forEach(tileset => scene.load.image(tileset.key, tileset.src));
        // map tilemap
        const tilemap = Assets.ref.getMapTilemap(map.id);
        scene.load.tilemapTiledJSON(tilemap.key, tilemap.src);
        // map main music
        const mapMusic = Assets.ref.getMapMainMusic(map.id);
        scene.load.audio(mapMusic.key, mapMusic.src);
        //map npcs
        Assets.ref.getMapCharacters(map.id).forEach(character => scene.load.atlas(character.key, character.path.texture, character.path.atlas));
        // wild monsters (if there's)
        if (map.hasWild)
            map.wildAppearence.forEach(wildId => this.loadMonster(wildId));
        // map custom asset (if there's)
        if (map.customAssets && map.customAssets.length > 0)
            this.fetchLoaders(map.customAssets);
    }

    async loadLevel (mapId) {}
};

export default Loader;