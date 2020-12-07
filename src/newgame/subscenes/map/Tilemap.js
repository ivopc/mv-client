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

    assemble () {
        this.tilemap = this.scene.add.tilemap(Assets.ref.getMapTilemap(this.mapData.id).key);
        this.tiles = this.fetchTilesets().map(tileset => this.tilemap.addTilesetImage(tileset.name, tileset.key));
        this.tilemap.layers.forEach((layer, i) => {
            switch (+layer.properties.type) {
                case LAYER_TYPES.COMMON: {  // se for layer comum
                    this.layers[i] = this.tilemap.createDynamicLayer(layer.name, this.tiles);
                    this.scene.$containers.map.add(this.layers[i]);
                    break;
                };
                case LAYER_TYPES.OVERLAY: { // se for overlay
                    this.overlay = this.tilemap.createDynamicLayer(layer.name, this.tiles);
                    this.scene.$containers.overlay.add(this.overlay);
                    break;
                };
                case LAYER_TYPES.COLLISION: { // se for layer de colisão
                    this.collisionLayer = layer;
                    break;
                };
            };
        });
    }

    fetchTilesets () {}

    async load (mapId) {
        const { scene } = this;
        this.clear();
        await new Promise(resolve => scene.$loader.loadAnotherMap(mapId, resolve));
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