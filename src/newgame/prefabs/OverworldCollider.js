import { TILE, DIRECTIONS, DIRECTIONS_HASH } from "@/newgame/constants/Overworld";
import { CHAR_TYPES } from "@/newgame/constants/Character";

class OverworldCollider {

    constructor (gameObject) {
        this.scene = gameObject.scene;
        this.gameObject = gameObject;
        this.events = {
            startMove: [],
            endMove: [],
            cantMove: []
        };
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

    collide (direction) {
        const newPosition = { ... this.gameObject._data.position };
        switch(direction) {
            case DIRECTIONS_HASH.UP: {
                newPosition.y --;
                break;
            };
            case DIRECTIONS_HASH.RIGHT: {
                newPosition.x ++;
                break;
            };
            case DIRECTIONS_HASH.DOWN: {
                newPosition.y ++;
                break;
            };
            case DIRECTIONS_HASH.LEFT: {
                newPosition.x --;
                break;
            };
        };
        const 
            tileY = this.scene.$tilemap.collisionLayer.data[newPosition.y] ? this.scene.$tilemap.collisionLayer.data[newPosition.y] : 0,
            tileX = tileY[newPosition.x] ? tileY[newPosition.x] : 0,
            tilesXY = tileY ? TILE.PROPERTIES[tileX.index] : 0;
        switch (this.gameObject._data.type) {
            case CHAR_TYPES.PLAYER: {
                return this.playerCollision(newPosition, tileY, tileX, tilesXY);
            };
            case CHAR_TYPES.ONLINE_PLAYER:
            case CHAR_TYPES.FOLLOWER:
            {
                return this.withoutPlayerCollision(newPosition, tilesXY); 
            };
            default: {
                return this.withPlayerCollision(newPosition, tilesXY);
            };
        };
    }

    playerCollision (newPosition, tileY, tileX, tilesXY) {
        if (!tileY || !tileX || !tilesXY || tilesXY.block || this.scene.$tilemap.objectsMap.exists(newPosition))
            return TILE.TYPES.BLOCK;
        this.gameObject._data.setPosition(newPosition.x, newPosition.y);
        if (tilesXY.door)
            return TILE.TYPES.WARP;
        if (tilesXY.wild)
            return TILE.TYPES.WILD_GRASS;
        if (tilesXY.event)
            return TILE.TYPES.EVENT;
        return TILE.TYPES.DEFAULT;
    }

    withPlayerCollision (newPosition, tilesXY) {
        const { x, y } = this.scene.$playerController.getPosition();
        const doesItCollidedWithPlayer = newPosition.x === x && newPosition.y === y;
        if (!doesItCollidedWithPlayer) {
            this.scene.$tilemap.objectsMap.switch(
                this.gameObject,
                this.gameObject._data.position,
                newPosition
            );
            this.gameObject._data.setPosition(newPosition.x, newPosition.y);
        };
        if (tilesXY.wild)
            return TILE.TYPES.WILD_GRASS;
        return doesItCollidedWithPlayer ? TILE.TYPES.BLOCK : TILE.TYPES.DEFAULT;
    }

    withoutPlayerCollision (newPosition, tilesXY) {
        this.gameObject._data.setPosition(newPosition.x, newPosition.y);
        if (tilesXY.wild)
            return TILE.TYPES.WILD_GRASS;
        return TILE.TYPES.DEFAULT;
    }
};

export default OverworldCollider;