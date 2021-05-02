import { TILE, DIRECTIONS, DIRECTIONS_HASH } from "@/newgame/constants/Overworld";
import { CHAR_TYPES } from "@/newgame/constants/Character";

class MovableOverworldGameObject {

    constructor (gameObjectData, levelTilemap) {
        this.events = {
            startMove: [],
            endMove: [],
            cantMove: []
        };
        this.data = gameObjectData;
        this.levelTilemap = levelTilemap;
    }

    addOnStartMove (callback) {
        this.events.startMove.push(callback);
    }

    addOnEndMove (callback) {
        this.events.endMove.push(callback);
    }

    addOnCantMove (callback) {
        this.events.cantMove.push(callback);
    }

    triggerStartMove (position) {
        this.events.startMove.forEach(fn => fn(position));
    }

    triggerEndMove (position) {
        this.events.endMove.forEach(fn => fn(position));
    }

    triggerCantMove (position) {
        this.events.cantMove.forEach(fn => fn(position));
    }

    addInteraction (fn) {
        this.setInteractive().on("pointerdown", fn);
    }

    collide (direction) {
        const position = { ... this.data.position };
        switch(direction) {
            case DIRECTIONS_HASH.UP: {
                position.y --;
                break;
            };
            case DIRECTIONS_HASH.RIGHT: {
                position.x ++;
                break;
            };
            case DIRECTIONS_HASH.DOWN: {
                position.y ++;
                break;
            };
            case DIRECTIONS_HASH.LEFT: {
                position.x --;
                break;
            };
        };
        const 
            tileY = this.levelTilemap.collisionLayer.data[position.y] ? this.levelTilemap.collisionLayer.data[position.y] : 0,
            tileX = tileY[position.x] ? tileY[position.x] : 0,
            tilesXY = tileY ? TILE.PROPERTIES[tileX.index] : 0;
        if (!this.data.isPlayer) {
            if (this.data.type == CHAR_TYPES.ONLINE_PLAYER) {
                this.data.setPosition(position.x, position.y);
                if (tilesXY.wild)
                    return TILE.TYPES.WILD_GRASS;
                return TILE.TYPES.DEFAULT;
            };
            const collision = position.x == this.scene.$player.data.x && position.y == this.scene.$player.data.y;
            if (!collision && this.data.type != CHAR_TYPES.FOLLOWER) {
                this.levelTilemap.objectsMap.remove(this.data.position);
                this.levelTilemap.objectsMap.add(this, this.data.position);
                this.data.setPosition(position.x, position.y);
            };
            if (tilesXY.wild)
                return TILE.TYPES.WILD_GRASS;
            return collision ? TILE.TYPES.BLOCK : TILE.TYPES.DEFAULT;
        };

        if (!tileY || !tileX || !tilesXY || tilesXY.block || this.levelTilemap.objectsMap.exists(position))
            return TILE.TYPES.BLOCK;

        this.data.setPosition(position.x, position.y);

        if (tilesXY.door)
            return TILE.TYPES.WARP;

        if (tilesXY.wild)
            return TILE.TYPES.WILD_GRASS;

        if (tilesXY.event)
            return TILE.TYPES.EVENT;
        
        return TILE.TYPES.DEFAULT;
    }
};

export default MovableOverworldGameObject;