import { TILE, DIRECTIONS, DIRECTIONS_HASH } from "@/game/constants/Overworld";
import { CHAR_TYPES } from "@/game/constants/Character";

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
        return TILE.TYPES.DEFAULT; // {placeholder}
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
        // ok alright, that's ugly. it's a method to get current tile collision properties
        const tile = TILE.PROPERTIES[
            this.scene.$tilemap.getCollisionTileData(newPosition, this.gameObject._data.getCurrentFloor()).index || 0
        ];
        switch (this.gameObject._data.type) {
            case CHAR_TYPES.PLAYER: {
                return this.playerCollision(newPosition, tile);
            };
            case CHAR_TYPES.ONLINE_PLAYER:
            case CHAR_TYPES.FOLLOWER:
            {
                return this.withoutPlayerCollision(newPosition, tile); 
            };
            default: {
                return this.withPlayerCollision(newPosition, tile);
            };
        };
    }

    playerCollision (newPosition, tile) {
        if (!tile || tile.block || this.scene.$tilemap.objectsMap.exists(newPosition))
            return TILE.TYPES.BLOCK;
        this.gameObject._data.setPosition(newPosition.x, newPosition.y);
        if (tile.door)
            return TILE.TYPES.WARP;
        if (tile.wild)
            return TILE.TYPES.WILD_GRASS;
        if (tile.event)
            return TILE.TYPES.EVENT;
        return TILE.TYPES.DEFAULT;
    }

    withPlayerCollision (newPosition, tile) {
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
        if (tile.wild)
            return TILE.TYPES.WILD_GRASS;
        return doesItCollidedWithPlayer ? TILE.TYPES.BLOCK : TILE.TYPES.DEFAULT;
    }

    withoutPlayerCollision (newPosition, tile) {
        this.gameObject._data.setPosition(newPosition.x, newPosition.y);
        if (tile.wild)
            return TILE.TYPES.WILD_GRASS;
        return TILE.TYPES.DEFAULT;
    }
};

export default OverworldCollider;