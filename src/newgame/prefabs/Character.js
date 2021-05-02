import { STEP_TIME, TILE, DIRECTIONS, DIRECTIONS_HASH } from "@/newgame/constants/Overworld";
import { CHAR_TYPES } from "@/newgame/constants/Character";

import { positionToRealWorld } from "@/newgame/utils";
import { timedEvent } from "@/newgame/utils/scene.promisify";

import Database from "@/newgame/managers/Database";

import CharacterModel from "@/newgame/models/Character";

import RawCharacter from "./RawCharacter";
import MovableOverworldGameObject from "./MovableOverworldGameObject";
import BalloonDialog from "./BalloonDialog";

/*
Arrumar: checkPlayerPositionTamer, depthSort ao end da step
*/

class Character extends RawCharacter {

    constructor (scene, data) {
        super(
            scene, 
            positionToRealWorld(data.position.x), 
            positionToRealWorld(data.position.y),
            data
        );
        this._data = new CharacterModel(data);
        this.physicsController = new MovableOverworldGameObject(
            this._data, 
            scene.$tilemap
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
        if ("visible" in data)
            this.visible = data.visible;
        this.changeOrigin(this._data.position.facing);
    }

    changeSprite (sprite) {
        if (this.scene.textures.exists(Database.ref.character[sprite].atlas)) {
            this._data.setSprite(sprite);
            this.rawSetSprite(sprite);
        } else {
            this.loadSpriteAsync(sprite);
        };
    }

    rawSetPosition (x, y) {
        this.setPosition(positionToRealWorld(x), positionToRealWorld(y));
        this._data.setPosition(x, y);
    }

    // abstract method to make current gameObject to interact with facing gameObject
    interact () {
        const position = { ... this._data.position };
        const gameObjectsMap = this.scene.$tilemap.objectsMap;
        let gameObject;
        switch (position.facing) {
            case DIRECTIONS_HASH.UP: {
                gameObject = gameObjectsMap.get({ x: position.x, y: --position.y });
                break;
            };
            case DIRECTIONS_HASH.RIGHT: {
                gameObject = gameObjectsMap.get({ x: ++position.x, y: position.y });
                break;
            };
            case DIRECTIONS_HASH.DOWN: {
                gameObject = gameObjectsMap.get({ x: position.x, y: ++position.y });
                break;
            };
            case DIRECTIONS_HASH.LEFT: {
                gameObject = gameObjectsMap.get({ x: --position.x, y: position.y });
                break;
            };
        };
        return gameObject;
    }

    addPointerInteraction (fn) {
        this.setInteractive().on("pointerdown", fn);
    }

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
        this._data.setFollower(follower._data.name);
    }

    removeFollower () {
        if (!this._data.hasFollower)
            return;
        this.scene.$charactersController.removeFollower(this._data.follower.id);
        this._data.removeFollower();
    }

    followMe (position) {
        if (this._data.hasFollower)
            this.scene.$charactersController.getFollower(this._data.follower.id).move(position.facing);
    }

    addGrass () {
        this.addGrassOverlay();
        this.addGrassParticles();
        this.scene.$network.requestWildEncounter();
    }

    removeGrass () {}

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

    async move (direction) {
        if (this._data.isPlayer && (this._data.moveInProgress || this._data.stop))
            return;
        const collision = this.physicsController.collide(direction);
        await this.walk(direction, collision);
        switch (this._data.type) {
            case CHAR_TYPES.PLAYER: {
                switch (collision) {
                    case TILE.TYPES.WARP: {
                        this.requestLevelChange();
                        break;
                    };
                    case TILE.TYPES.WILD_GRASS: {
                        this.addGrass();
                        break;
                    };
                    case TILE.TYPES.EVENT: {break;};
                };
                break;
            };
            case CHAR_TYPES.ONLINE_PLAYER:
            case CHAR_TYPES.NPC:
            case CHAR_TYPES.FOLLOWER:
            case CHAR_TYPES.TAMER:
            {
                switch (collision) {
                    case TILE.TYPES.WILD_GRASS: {
                        this.addGrass();
                        break;
                    };
                };
            };
        };
    }

    startToMove (direction, older) {
        this._data.setMoveInProgress(true);
        this.removeGrass();
        this._data.setFacing(direction);
        this.anims.stop();
        this.followMe(older);
        if (this._data.isPlayer)
            this.sendMove(direction);
    }

    preventedToMove (direction) {
        this.face(direction);
        this.physicsController.triggerCantMove({
            facing: direction,
            x: this._data.position.x,
            y: this._data.position.y
        });
    }

    async walk (direction, collision) {
        const older = { ... this._data.position };
        switch (collision) {
            case TILE.TYPES.BLOCK: {
                this.preventedToMove(direction);
                return;
            };
        };
        this.startToMove(direction, older);
        await this.walkAnimation(direction);
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
        const needToSendFacing = this._data.isPlayer && this._data.position.facing !== direction;
        this._data.setFacing(direction);
        this.anims.stop();
        this.playIdleAnim(direction);
        if (needToSendFacing)
            this.sendFacing(direction);
    }

    async walkAnimation (direction) {
        switch(direction) {
            case DIRECTIONS_HASH.UP: {
                this.scene.tweens.add({
                    targets: [this, ... this.elementsToFollow],
                    ease: "Linear",
                    duration: STEP_TIME.STEP * 4,
                    y: "-=" + TILE.SIZE
                });
                break;
            };
            case DIRECTIONS_HASH.RIGHT: {
                this.scene.tweens.add({
                    targets: [this, ... this.elementsToFollow],
                    ease: "Linear",
                    duration: STEP_TIME.STEP * 4,
                    x: "+=" + TILE.SIZE
                });
                break;
            };
            case DIRECTIONS_HASH.DOWN: {
                this.scene.tweens.add({
                    targets: [this, ... this.elementsToFollow],
                    ease: "Linear",
                    duration: STEP_TIME.STEP * 4,
                    y: "+=" + TILE.SIZE
                });
                break;
            };
            case DIRECTIONS_HASH.LEFT: {
                this.scene.tweens.add({
                    targets: [this, ... this.elementsToFollow],
                    ease: "Linear",
                    duration: STEP_TIME.STEP * 4,
                    x: "-=" + TILE.SIZE
                });
                break;
            };
        };
        await this.walkStepFeet(direction);
        await this.walkStepIdle(direction);
        this.walkStepEnd(direction);
    }

    walkStepFeet (direction) {
        this.physicsController.triggerStartMove({
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
        this._data.setMoveInProgress(false);
        this.playIdleAnim(direction);
        this.physicsController.triggerEndMove({
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