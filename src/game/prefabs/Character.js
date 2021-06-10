import RawCharacter from "./RawCharacter";
import OverworldCollider from "./OverworldCollider";
import BalloonDialog from "./BalloonDialog";

import Database from "@/game/managers/Database";

import CharacterModel from "@/game/models/Character";

import { positionToOverworld } from "@/game/utils";
import { timedEvent } from "@/game/utils/scene.promisify";

import { STEP_TIME, TILE, DIRECTIONS, DIRECTIONS_HASH } from "@/game/constants/Overworld";
import { CHAR_TYPES, MOVE_TYPES } from "@/game/constants/Character";

/*
TODO:
checkPlayerPositionTamer, depthSort ath the end of move
*/

class Character extends RawCharacter {

    constructor (scene, data) {
        super(
            scene, 
            positionToOverworld(data.position.x), 
            positionToOverworld(data.position.y),
            data
        );
        this._data = new CharacterModel(data);
        this.physics = new OverworldCollider(this);
        this.elementsContainer = scene.add.container();
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
            this.loadSprite(sprite);
        };
    }

    setOverworldPosition (x, y) {
        this.setPosition(positionToOverworld(x), positionToOverworld(y));
        this._data.setPosition(x, y);
    }

    // abstract method to make current gameObject to interact with gameObject 
    // that it  facing 
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

    displayNickname (name) {
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

    removeSprite () {
        if (this.elements.nickname)
            this.elements.nickname.destroy();
        this.removeTypingBalloon();
        this.destroy();
    }

    async move (direction) {
        const collision = this.physics.collide(direction);
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
        return collision;
    }

    startToMove (direction, older) {
        this._data.setMoveInProgress(true);
        this.removeGrass();
        this._data.setFacing(direction);
        this.anims.stop();
        this.followMe(older);
    }

    preventedToMove (direction) {
        this.face(direction);
        this.physics.triggerCantMove({
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
        if (direction === "toPlayer") {
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
        this._data.setFacing(direction);
        this.anims.stop();
        this.playIdleAnim(direction);
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
        this.physics.triggerStartMove({
            facing: direction,
            x: this._data.position.x,
            y: this._data.position.y
        });
        this.changeOrigin(direction);
        this.switchSpriteWalkStep(direction, this._data.stepFlag, MOVE_TYPES.WALK);
        return timedEvent(STEP_TIME.STEP * 2, this.scene);
    }

    walkStepIdle (direction) {
        this.switchSpriteWalkStep(direction, 0, MOVE_TYPES.IDLE);
        return timedEvent(STEP_TIME.STEP * 2, this.scene);
    }

    walkStepEnd (direction) {
        this._data.setMoveInProgress(false);
        this.playIdleAnim(direction);
        this.physics.triggerEndMove({
            facing: direction,
            x: this._data.position.x,
            y: this._data.position.y
        });
    }

    switchSpriteWalkStep (direction, flag, type) {
        if (typeof(flag) === "number" && type === MOVE_TYPES.WALK) {
            flag = flag ? 0 : 1;
            this._data.stepFlag = flag;
        };
        this.setFrame(Database.ref.character[this._data.sprite].name + "_" + DIRECTIONS[direction] + "_" + type + flag);
    }

    static addtoLevel (scene, characterData) {
        const gameObject = new Character(scene, characterData);
        scene.add.existing(gameObject);
        scene.$charactersController.addStaticCharacter(gameObject);
    }
};

export default Character;
