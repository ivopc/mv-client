import Database from "@/newgame/managers/Database";
import Assets from "@/newgame/managers/Assets";

import LevelData from "@/newgame/managers/LevelData";

import { LAYER_TYPES } from "@/newgame/constants/Tilemap";

class Tilemap {

    constructor (scene) {
        this.scene = scene;
        this.levelData = Database.ref.level[LevelData.ref.id];
        this.tilemap;
        this.tileset;
        this.layers = [];
        this.overlay;
        this.collisionLayer;
    }

    create () {
        this.tilemap = this.scene.add.tilemap(Assets.ref.getLevelTilemap(this.levelData.id).key);
        this.tileset = this.fetchTilesets().map(tileset => this.tilemap.addTilesetImage(tileset.name, tileset.key, 32, 32, 1, 2));
        this.tilemap.layers.forEach((layer, index) => {
            switch (Number(layer.properties.type)) {
                case LAYER_TYPES.DEFAULT: {
                    this.layers[index] = this.tilemap.createLayer(layer.name, this.tileset);
                    this.scene.$containers.map.add(this.layers[index]);
                    break;
                };
                case LAYER_TYPES.OVERLAY: {
                    this.overlay = this.tilemap.createLayer(layer.name, this.tileset);
                    this.scene.$containers.overlay.add(this.overlay);
                    break;
                };
                case LAYER_TYPES.COLLISION: {
                    this.collisionLayer = layer;
                    break;
                };
            };
        });
    }

    fetchTilesets () {
        return Assets.ref.getLevelTilesets(this.levelData.id);
    }

    fetchLayerTilesets () {}

    setLevelData (data) {
        this.levelData = data;
    }

    clear () {
        this.tilemap.destroy();
        this.layers.forEach(layer => layer.destroy());
        this.layers = [];
        this.tileset = null;
        this.overlay.destroy();
        this.collisionLayer = null;
    }
};

export default Tilemap;