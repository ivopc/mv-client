import RawLoader from "@/newgame/managers/RawLoader";

import Database from "@/newgame/managers/Database";
import Assets from "@/newgame/managers/Assets";

import PlayerData from "@/newgame/managers/PlayerData";
import MapData from "@/newgame/managers/MapData";

class Loader extends RawLoader {
    fetchAssets () {
        const scene = this.scene;
        // player character sprite
        const playerOverworldSprite = Assets.ref.getOverworldCharacter(PlayerData.ref.character.sprite);
        scene.load.atlas(playerOverworldSprite.key, playerOverworldSprite.sprite, playerOverworldSprite.atlas);
        const map = Database.ref.maps[MapData.ref.id];
        // map tilesets
        Assets.ref.getMapTilesets(map.id).forEach(tileset => scene.load.image(tileset.key, "assets/img/tileset/" + tileset.src));
        // map tilemap
        const tilemap = Assets.ref.getMapTilemap(map.id);
        scene.load.tilemapTiledJSON(tilemap.key, tilemap.src);
        // map main music
        const mapMusic = Assets.ref.getMapMainMusic(map.id);
        scene.load.audio(mapMusic.key, mapMusic.src);
        // wild monsters (if there's)
        if (map.hasWild)
            map.wildAppearence.forEach(wildId => this.loadMonster(wildId));
        // map custom asset (if there's)
        if (map.customAssets && map.customAssets.length > 0) {
            map.customAssets.forEach(asset => {
                switch (asset.type) {
                    case "image": {
                        scene.load.image(asset.key, asset.src);
                        break;
                    };
                    case "spritesheet": {
                        scene.load.spritesheet(asset.key, asset.src, {frameWidth: asset.frame.width, frameHeight: asset.frame.height});
                        break;
                    };
                    case "atlas": {
                        scene.load.atlas(asset.key, asset.src, asset.atlas);
                        break;
                    };
                }
            });
        };
    }
};

export default Loader;