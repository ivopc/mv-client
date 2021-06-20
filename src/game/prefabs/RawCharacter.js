import Phaser from "phaser";

import Database from "@/game/managers/Database";
import Assets from "@/game/managers/Assets";

import { DIRECTIONS } from "@/game/constants/Overworld";
import { CHARACTERS } from "@/game/constants/Character";

import { loadComplete } from "@/game/utils/scene.promisify";

class RawCharacter extends Phaser.GameObjects.Sprite {
    constructor (scene, x, y, data) {
        super(scene, x, y, data);
        this._data = data;
        // checking if sprite is already loaded, if don't we need to load it async
        if (scene.textures.exists(Database.ref.character[data.sprite].atlas)) {
            this.rawSetSprite(data.sprite);
        } else {
            this.rawSetSprite(CHARACTERS.BASE);
            const sprite = data.sprite;
            this.loadSprite(sprite);
            this._data.sprite = CHARACTERS.BASE;
        };
    }

    rawSetSprite (sprite) {
        this.setTexture(Database.ref.character[sprite].atlas);
        this.setFrame(Database.ref.character[sprite].name + "_" + DIRECTIONS[this._data.position.facing] + "_idle0");
        // add anim to 4 character directions
        DIRECTIONS.forEach(direction => {
            this.scene.anims.create({
                key: Database.ref.character[sprite].name + "_idle_" + direction,
                frames: [
                    {key: Database.ref.character[sprite].atlas, frame: Database.ref.character[sprite].name + "_" + direction + "_idle0"}, 
                    {key: Database.ref.character[sprite].atlas, frame: Database.ref.character[sprite].name + "_" + direction + "_idle1"}
                ],
                frameRate: 2,
                repeat: -1
            });
            this.anims.load(Database.ref.character[sprite].name + "_idle_" + direction);
        });
        this.playIdleAnim(this._data.position.facing);
        this.changeOrigin(this._data.position.facing);
    }

    playIdleAnim (direction, type = "idle") {
        this.anims.play(Database.ref.character[this._data.sprite].name + "_" + type + "_" + DIRECTIONS[direction]);
    }

    changeOrigin (direction) {
        const origin = Database.ref.character[this._data.sprite].origin[DIRECTIONS[direction]];
        this.setOrigin(origin.x, origin.y);
    }

    async loadSprite (sprite) {
        const atlas = Database.ref.character[sprite].atlas;
        const characterSprite = Assets.ref.getOverworldCharacter(sprite);
        this.scene.load.atlas(
            characterSprite.key, 
            characterSprite.path.texture, 
            characterSprite.path.atlas
        );
        this.scene.load.start();
        await loadComplete(this.scene);
        this._data.sprite = sprite;
        this.rawSetSprite(sprite);
    }
};

export default RawCharacter;
