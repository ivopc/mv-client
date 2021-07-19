import RawCharacter from "./RawCharacter";
import OverworldCollider from "./OverworldCollider";

import Database from "@/game/managers/Database"; // {legacy}
import Level from "@/game/scenes/level";

import CharacterModel from "@/game/models/CharacterModel";

import { positionToOverworld } from "@/game/utils";
import { timedEvent } from "@/game/utils/scene.promisify";

import { STEP_TIME, TILE, DIRECTIONS, DIRECTIONS_HASH } from "@/game/constants/Overworld";
import { CHAR_TYPES, MOVE_TYPES, WALK_STEP_FLAGS } from "@/game/constants/Character";

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
        this.elements = { // {legacy}
            nickname: null,
            clan: null,
            balloon: {
                typing: null,
                dialog: null,
                emotion: null,
                quest: null
            },
            overlay: {
                grass: null
            }
        }; 
        if ("visible" in data) // {legacy}
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

    setOverworldPositionRaw (x, y) {
        this.setPosition(positionToOverworld(x), positionToOverworld(y));
        this._data.setPosition(x, y);
    }

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

    lookAt (gameObject) {}

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
        const follower = Character.addtoLevel(/*{ ... }*/);
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
                this.walkTween("y", "-=");
                break;
            };
            case DIRECTIONS_HASH.RIGHT: {
                this.walkTween("x", "+=");
                break;
            };
            case DIRECTIONS_HASH.DOWN: {
                this.walkTween("y", "+=");
                break;
            };
            case DIRECTIONS_HASH.LEFT: {
                this.walkTween("x", "-=");
                break;
            };
        };
        await this.walkStepFeet(direction);
        await this.walkStepIdle(direction);
        this.walkStepEnd(direction);
    }

    walkTween (axis, operator) {
        this.scene.tweens.add({
            targets: this,
            ease: "Linear",
            duration: STEP_TIME.STEP * 4,
            [axis]: operator + TILE.SIZE
        });
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
            flag = flag ? WALK_STEP_FLAGS.LEFT : WALK_STEP_FLAGS.RIGHT;
            this._data.stepFlag = flag;
        };
        this.setFrame(Database.ref.character[this._data.sprite].name + "_" + DIRECTIONS[direction] + "_" + type + flag);
    }

    destroy () {
        super.destroy();
        this.container.destroy();
    }

    static addtoLevel (characterData) {
        const scene = Level.ref;
        const gameObject = new Character(scene, characterData);
        scene.add.existing(gameObject);
        scene.$charactersController.addStaticCharacter(gameObject);
        return gameObject;
    }
};

export default Character;