import { STEP_TIME, TILE, DIRECTIONS, DIRECTIONS_HASH } from "@/newgame/constants/Overworld";
import { CHAR_TYPES } from "@/newgame/constants/Character";

import { positionToRealWorld } from "@/newgame/utils";
import { timedEvent } from "@/newgame/utils/scene.promisify";

import Database from "@/newgame/managers/Database";

import RawCharacter from "./RawCharacter";
import BalloonDialog from "./BalloonDialog";

/*
Arrumar: subscribe do socket e checkPlayerPositionTamer 
*/

class Character extends RawCharacter {

    constructor (scene, data) {
        super(
            scene, 
            positionToRealWorld(data.position.x), 
            positionToRealWorld(data.position.y),
            data
        );
        this.elements = {
            nickname: null,
            clan: null,
            balloon: {
                typing: null,
                dialog: null,
                emotion: null,
                quest: null
            },
            grassOverlay: null
        };
        this.events = {
            startMove: [],
            endMove: [],
            cantMove: []
        };
        this.grassOverlay;
        data = data || {};
        data.position = data.position || {};
        data.position.x = data.position.x || 0;
        data.position.y = data.position.y || 0;
        data.position.facing = data.position.facing || 0;
        data.follower = data.follower || {};
        data.follower.has = data.follower.has || false;
        data.follower.id = data.follower.id || null;
        if ("visible" in data)
            this.visible = data.visible;
        this._data = {
            type: data.type,
            name: data.name,
            sprite: data.sprite,
            atlas: Database.ref.character[data.sprite].atlas,
            position: {
                x: data.position.x,
                y: data.position.y,
                facing: data.position.facing
            },
            stepFlag: 0,
            follower: {
                has: data.follower.has,
                id: data.follower.name
            },
            moveInProgress: false
        };
        if (data.isTamer) {
            this._data.isTamer = true;
            this._data.maxView = data.maxView;
        };
        if (data.type === CHAR_TYPES.ONLINE_PLAYER) {
            this._data.nickname = data.nickname;
        };
        this.changeOrigin(data.position.facing);
    }

    changeSprite (sprite) {
        if (this.scene.textures.exists(Database.ref.character[sprite].atlas)) {
            this._data.sprite = sprite;
            this.rawSetSprite(sprite);
        } else {
            this.loadAtlasAsync(sprite);
        };
    }

    onStartMove(callback) {
        this.events.startMove.push(callback);
    }

    onEndMove(callback) {
        this.events.endMove.push(callback);
    }

    onCantMove(callback) {
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

    // the diff between: this on player use pointer to click in the sprite
    addPointerInteraction (fn) {
        this.setInteractive().on("pointerdown", fn);
    }

    // on player press game interaction key/d-pad
    onInteraction () {}

    createFollower (sprite) {
        const position = { ... this._data.position };
        switch (this._data.position.facing) {
            case DIRECTIONS_HASH.UP: {
                position.y ++;
                break;
            };
            case DIRECTIONS_HASH.RIGHT: {
                position.x --;
                break;
            };
            case DIRECTIONS_HASH.DOWN: {
                position.y --;
                break;
            };
            case DIRECTIONS_HASH.LEFT: {
                position.x ++;
                break;
            };
        };
        const follower = this.scene.appendCharacter({
            name: "follower_" + Date.now(),
            char: sprite,
            pos: {
                x: position.x,
                y: position.y
            },
            dir: this._data.position.facing,
            type: CHAR_TYPES.FOLLOWER
        });
        this.setFollower(follower._data.name);
    }

    setFollower (id) {
        this._data.follower = { has: true, id };
    }

    removeFollower () {
        if (!this._data.follower.has)
            return;
        this.scene.follower_data[this._data.follower.id].destroy();
        delete this.scene.follower_data[this._data.follower.id];
        this._data.follower = {
            has: false,
            id: null
        };
    }

    addGrassOverlay (sprite) {
        this.grassOverlay = sprite;
    }

    removeGrassOverlay () {
        if (this.grassOverlay) {
            this.grassOverlay.destroy();
            this.grassOverlay = null;
        };
    }

    addTypingBalloon () {
        this.elements.balloon.typing = new BalloonDialog(this.scene)
            .setOrigin(0.5)
            .setX(this.getCenter().x)
            .setY(this.y - this.displayHeight + 10);
    }

    removeTypingBalloon () {
        if (this.elements.balloon.typing) {
            this.elements.balloon.typing.destroy();
            this.elements.balloon.typing = null;
        };
    }

    displayName (name) {
        this.elements.nickname = this.scene.add.text(0, 0, name, { 
            fontFamily: "Century Gothic", 
            fontSize: 12,
            color: "#fff" 
        })
            .setOrigin(0.5)
            .setX(this.getCenter().x)
            .setY(this.y + this.displayHeight);
        this.scene.containers.main.add(this.elements.nickname);
    }

    get elementsToFollow () {
        const els = [];
        if (this.elements.nickname)
            els.push(this.elements.nickname);

        if (this.elements.balloon.typing)
            els.push(this.elements.balloon.typing);

        return els;
    }

    elementsFollow () {
        if (this.elements.nickname) {
            this.elements.nickname
                .setOrigin(0.5)
                .setX(this.getCenter().x)
                .setY(this.y + this.displayHeight);
        };

        if (this.elements.balloon.typing) {
            this.elements.balloon.typing
                .setOrigin(0.5)
                .setX(this.getCenter().x)
                .setY(this.y - this.displayHeight + 10);
        };
    }

    removeSprite () {
        if (this.elements.nickname)
            this.elements.nickname.destroy();
        this.removeTypingBalloon();
        this.destroy();
    }

    collide (direction) {
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

    async move (direction) {
        if (this._data.isPlayer) {
            if (this._data.moveInProgress || this._data.stop)
                return;
        };
        await this.walk(direction);
    }

    async walk (direction) {
        const older = { ... this._data.position };
        let internalCallback;
        const collision = this.collide(direction);
        switch (this._data.type) {
            case CHAR_TYPES.PLAYER: {
                switch (collision) {
                    case TILE.TYPES.BLOCK: {
                        this._data.position.facing = direction;
                        this.playIdleAnim(direction);
                        this.sendFacing(direction);
                        this.triggerCantMove({
                            facing: direction,
                            x: this._data.position.x,
                            y: this._data.position.y
                        });
                        return;
                    };
                    case TILE.TYPES.WARP: {
                        let teleport = this.scene.cache.json.get(this.scene.getCurrentMapName("events")).map.teleport.find(position => position.x === this._data.position.x && position.y === this._data.position.y);
                        internalCallback = () => this.scene.requestMapChange(teleport.mid, teleport.tid);
                        break;
                    };
                    case TILE.TYPES.WILD_GRASS: {
                        const posistion = this._data.position;
                        this.removeGrassOverlay();
                        internalCallback = () => {
                            this.addGrassOverlay(this.scene.appendGrassOverlay(posistion.x, posistion.y));
                            this.scene.appendGrassParticles(posistion.x, posistion.y);
                            this.scene.requestWildBattle();
                        };
                        break;
                    };
                    case TILE.TYPES.EVENT: {
                        const 
                            mapData = this.scene.cache.json.get(this.scene.getCurrentMapName("events")),
                            event = mapData.events.config.find(position => position.x === this._data.position.x && position.y === this._data.position.y);
                        internalCallback = () => {
                            if (mapData.events.script[event.id].requiredFlagValueToExec.indexOf(this.scene.flag) >= 0) {
                                this.scene.automatizeAction({
                                    type: 2
                                }, mapData.events.script[event.id].script);
                            };
                        };
                        break;
                    };
                };
                this.removeGrassOverlay();
                this._data.moveInProgress = true;
                this._data.position.facing = direction;
                this.anims.stop();
                this.sendMove(direction);
                if (this._data.follower.has)
                    this.scene.follower_data[this._data.follower.id].walk(older.facing);
                break;
            };
            case CHAR_TYPES.ONLINE_PLAYER:
            case CHAR_TYPES.NPC:
            case CHAR_TYPES.FOLLOWER:
            case CHAR_TYPES.TAMER:
            {
                switch(collision) {
                    case TILE.TYPES.BLOCK: {
                        this._data.position.facing = direction;
                        this.playIdleAnim(direction);
                        return;
                    };
                    case TILE.TYPES.WILD_GRASS: {
                        const posistion = this._data.position;
                        this.removeGrassOverlay();
                        internalCallback = () => {
                            this.addGrassOverlay(this.scene.appendGrassOverlay(posistion.x, posistion.y));
                            this.scene.appendGrassParticles(posistion.x, posistion.y);
                        };
                        break;
                    };
                };
                this._data.moveInProgress = true;
                this.removeGrassOverlay();
                this._data.position.facing = direction;
                this.anims.stop();
                if (this._data.follower.has)
                    this.scene.follower_data[this._data.follower.id].walk(older.facing);
                if (this._data.type == CHAR_TYPES.NPC || this._data.type == CHAR_TYPES.TAMER) {
                    const element = this.scene.cache.json.get(this.scene.getCurrentMapName("events")).elements.config[this._data.name];
                    if (element.saveDynamicPosition) {
                        const el = element[this.scene.flag] || element["default"];
                        el.position = {
                            x: this._data.position.x,
                            y: this._data.position.y,
                            facing: this._data.position.facing
                        };
                    };
                };
                break;
            };
        };
        await this.animationWalk(direction, internalCallback);
    }

    face (direction) {
        if (this._data.moveInProgress)
            return;
        if (direction == "toplayer") {
            switch(this.scene.$playerController.getFacing()) {
                case DIRECTIONS_HASH.UP: {
                    direction = DIRECTIONS_HASH.DOWN;
                    break;
                };
                case DIRECTIONS_HASH.DOWN: {
                    direction = DIRECTIONS_HASH.UP;
                    break;
                };
                case DIRECTIONS_HASH.LEFT: {
                    direction = DIRECTIONS_HASH.RIGHT;
                    break;
                };
                case DIRECTIONS_HASH.RIGHT: {
                    direction = DIRECTIONS_HASH.LEFT;
                    break;
                };
            };
        };
        this._data.position.facing = direction;
        this.anims.stop();
        this.playIdleAnim(direction);
        if (this._data.isPlayer)
            this.sendFacing(direction);
    }

    async animationWalk (direction, internalCallback) {
        switch(direction) {
            case DIRECTIONS_HASH.UP: {
                this.scene.tweens.add({
                    targets: [this, ... this.elementsToFollow],
                    ease: "Linear",
                    duration: STEP_TIME.STEP * 4,
                    y: "-=" + TILE.SIZE,
                });
                break;
            };
            case DIRECTIONS_HASH.RIGHT: {
                this.scene.tweens.add({
                    targets: [this, ... this.elementsToFollow],
                    ease: "Linear",
                    duration: STEP_TIME.STEP * 4,
                    x: "+=" + TILE.SIZE,
                });
                break;
            };
            case DIRECTIONS_HASH.DOWN: {
                this.scene.tweens.add({
                    targets: [this, ... this.elementsToFollow],
                    ease: "Linear",
                    duration: STEP_TIME.STEP * 4,
                    y: "+=" + TILE.SIZE,
                });
                break;
            };
            case DIRECTIONS_HASH.LEFT: {
                this.scene.tweens.add({
                    targets: [this, ... this.elementsToFollow],
                    ease: "Linear",
                    duration: STEP_TIME.STEP * 4,
                    x: "-=" + TILE.SIZE,
                });
                break;
            };
        };
        await this.walkStepFeet(direction);
        await this.walkStepIdle(direction);
        this.walkStepEnd(direction);
        if (typeof(internalCallback) == "function")
            internalCallback();
    }

    walkStepFeet (direction) {
        this.triggerStartMove({
            facing: direction,
            x: this._data.position.x,
            y: this._data.position.y
        });
        this.changeOrigin(direction);
        this.switchSpriteStep(direction, this._data.stepFlag, "walk");
        return timedEvent(STEP_TIME.STEP * 2, this.scene);
    }

    walkStepIdle (direction) {
        this.switchSpriteStep(direction, 0, "idle");
        return timedEvent(STEP_TIME.STEP * 2, this.scene);
    }

    walkStepEnd (direction) {
        this._data.moveInProgress = false;
        // se for o jogador checar posição dos domadores
        /*if (this._data.isPlayer) 
            this.scene.checkPlayerPositionTamer(this.scene.cache.json.get(this.scene.getCurrentMapName("events")));*/
        this.playIdleAnim(direction);
        // atualizando profundidade dos objetos do grupo main
        //this.scene.depthSort();
        this.triggerEndMove({
            facing: direction,
            x: this._data.position.x,
            y: this._data.position.y
        });
    }

    switchSpriteStep (direction, flag, type) {
        if (typeof(flag) == "number" && type == "walk") {
            flag = flag ? 0 : 1;
            this._data.stepFlag = flag;
        };
        this.setFrame(Database.ref.character[this._data.sprite].name + "_" + DIRECTIONS[direction] + "_" + type + flag);
    }
};

export default Character;