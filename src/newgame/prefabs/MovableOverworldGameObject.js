import { TILE, DIRECTIONS, DIRECTIONS_HASH } from "@/newgame/constants/Overworld";
import { CHAR_TYPES } from "@/newgame/constants/Character";

class MovableOverworldGameObject {

    constructor () {
        this.events = {
            startMove: [],
            endMove: [],
            cantMove: []
        };
        this.grassOverlay;
    }

    onStartMove (callback) {
        this.events.startMove.push(callback);
    }

    onEndMove (callback) {
        this.events.endMove.push(callback);
    }

    onCantMove (callback) {
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

    collide () {
        const position = { ... this._data.position };
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
            tileY = this.scene.$tilemap.collisionLayer.data[position.y] ? this.scene.$tilemap.collisionLayer.data[position.y] : 0,
            tileX = tileY[position.x] ? tileY[position.x] : 0,
            tilesXY = tileY ? TILE.PROPERTIES[tileX.index] : 0;
        if (!this._data.isPlayer) {
            if (this._data.type == CHAR_TYPES.ONLINE_PLAYER) {
                this._data.position.x = position.x;
                this._data.position.y = position.y;
                if (tilesXY.wild)
                    return TILE.TYPES.WILD_GRASS;
                return TILE.TYPES.DEFAULT;
            };
            const collision = position.x == this.scene.$player._data.x && position.y == this.scene.$player._data.y;
            if (!collision && this._data.type != CHAR_TYPES.FOLLOWER) {
                delete this.scene.mapObjectPosition[this._data.position.x + "|" + this._data.position.y];
                this.scene.mapObjectPosition[position.x + "|" + position.y] = this._data.name;
                this._data.position.x = position.x;
                this._data.position.y = position.y;
            };
            if (tilesXY.wild)
                return TILE.TYPES.WILD_GRASS;
            return collision ? TILE.TYPES.BLOCK : TILE.TYPES.DEFAULT;
        };

        if (!tileY || !tileX || !tilesXY || tilesXY.block /*|| this.scene.mapObjectPosition[position.x + "|" + position.y]*/)
            return TILE.TYPES.BLOCK;

        this._data.position.x = position.x;
        this._data.position.y = position.y;

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