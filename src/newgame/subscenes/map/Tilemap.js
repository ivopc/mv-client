import Database from "@/newgame/managers/Database";
import Assets from "@/newgame/managers/Assets";

import MapData from "@/newgame/managers/MapData";

import { LAYER_TYPES } from "@/newgame/constants/Tilemap";

class Tilemap {
    constructor (scene) {
        this.scene = scene;
        this.mapData = Database.ref.maps[MapData.ref.id];
        this.tilemap;
        this.layers = [];
        this.overlay;
        this.collisionLayer;
    }

    create () {
        this.tilemap = this.scene.add.tilemap(Assets.ref.getMapTilemap(this.mapData.id).key);
        this.tiles = this.fetchTilesets().map(tileset => this.tilemap.addTilesetImage(tileset.name, tileset.key, 32, 32, 1, 2));
        this.tilemap.layers.forEach((layer, index) => {
            switch (Number(layer.properties.type)) {
                case LAYER_TYPES.DEFAULT: {
                    this.layers[index] = this.tilemap.createLayer(layer.name, this.tiles);
                    this.scene.$containers.map.add(this.layers[index]);
                    break;
                };
                case LAYER_TYPES.OVERLAY: {
                    this.overlay = this.tilemap.createLayer(layer.name, this.tiles);
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
        return Assets.ref.getMapTilesets(this.mapData.id);
    }

    fetchLayerTilesets () {}

    async load (mapId) {
        const { scene } = this;
        this.clear();
        await new Promise(resolve => scene.$loader.loadLevel(mapId, resolve));
    }

    clear () {
        this.tilemap.destroy();
        this.layers.forEach(layer => layer.destroy());
        this.layers = [];
        this.overlay.destroy();
        this.collisionLayer = null;
    }
};

export default Tilemap;