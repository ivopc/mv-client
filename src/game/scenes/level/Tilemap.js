import LevelObjectsMap from "./LevelObjectsMap";
//import LevelObjectsList from "./LevelObjectsList";

import Database from "@/game/managers/Database";
import Assets from "@/game/managers/Assets";
import LevelData from "@/game/managers/LevelData";

import { LAYER_TYPES, getCollisionFloorName } from "@/game/constants/Tilemap";

class Tilemap {
    constructor (scene) {
        this.scene = scene;
        this.objectsMap = new LevelObjectsMap();
        //this.objectsMap = new LevelObjectsList();
        this.tilemap;
        this.tileset;
        this.layers = [];
        this.collisionLayers = [];
        this.overlay;
    }

    create () {
        this.tilemap = this.scene.add.tilemap(Assets.ref.getLevelTilemap(this.levelData.id).key);
        this.tileset = this.fetchTilesets().map(tileset => this.tilemap.addTilesetImage(tileset.name, tileset.key, 32, 32, 1, 2));
        this.tilemap.layers.forEach((layer, index) => this.appendLayerEach(layer, index));
    }

    appendLayerEach (layer, index) {
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
                this.collisionLayers.push(this.tilemap.createLayer(layer.name, this.tileset));
                break;
            };
        };
    }

    fetchTilesets () {
        return Assets.ref.getLevelTilesets(this.levelData.id);
    }

    fetchLayerTilesets () {}

    clear () {
        this.tilemap.destroy();
        this.layers.forEach(layer => layer.destroy());
        this.layers = [];
        this.collisionLayers(collisionLayer => collisionLayer.destroy());
        this.collisionLayer = [];
        this.tileset = null;
        this.overlay.destroy();
        this.objectsMap.clear();
    }

    getCollisionTileData ({ x, y }, floorIndex) {
        return this.tilemap.getTileAt(x, y, true, getCollisionFloorName(floorIndex));
    }

    get levelData () {
        return Database.ref.level[LevelData.ref.id];
    }
};

export default Tilemap;