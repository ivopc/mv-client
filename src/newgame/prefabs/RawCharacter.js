import Phaser from "phaser";

import Database from "@/newgame/managers/Database";

import { DIRECTIONS } from "@/newgame/constants/Overworld";

class RawCharacter extends Phaser.GameObjects.Sprite {
    constructor (scene, x, y, data) {
        super(scene, x, y, data);

        this.scene = scene;
        this._data = data;

        console.log("klol", Database.ref.character, Database.ref.character[data.sprite].atlas);

        console.log("exists", scene.textures.exists("character_char1_overworld"));

        // checking if sprite is already loaded, if don't we will load
        if (scene.textures.exists(Database.ref.character[data.sprite].atlas)) {
            this.rawSetSprite(data.sprite);
        } else {
            this.rawSetSprite(1);
            const sprite = data.sprite;
            this.loadSpriteAsync(sprite);
            this._data.sprite = 1;
        };
    }

    rawSetSprite (sprite) {
        // set texture
        this.setTexture(Database.ref.character[sprite].atlas);
        this.setFrame(Database.ref.character[sprite].name + "_" + DIRECTIONS[this._data.position.facing] + "_idle0");


        // add anim to 4 character directions
        for (let i = 0, l = DIRECTIONS.length; i < l; i++) {
            this.scene.anims.create({
                key: Database.ref.character[sprite].name + "_idle_" + DIRECTIONS[i],
                frames: [
                    {key: Database.ref.character[sprite].atlas, frame: Database.ref.character[sprite].name + "_" + DIRECTIONS[i] + "_idle0"}, 
                    {key: Database.ref.character[sprite].atlas, frame: Database.ref.character[sprite].name + "_" + DIRECTIONS[i] + "_idle1"}
                ],
                frameRate: 2,
                repeat: -1
            });

            // add anim to character sprite
            this.anims.load(Database.ref.character[sprite].name + "_idle_" + DIRECTIONS[i]);
        };

        // play on idle anim
        this.playIdleAnim(this._data.position.facing);
    }

    playIdleAnim (direction) {
        this.anims.play(Database.ref.character[this._data.sprite].name + "_idle_" + DIRECTIONS[direction]);
    }

    changeOrigin (direction) {
        const origin = Database.ref.character[this._data.sprite].origin[DIRECTIONS[direction]];
        this.setOrigin(origin.x, origin.y);
    }

    loadSpriteAsync (sprite) {
        const atlas = Database.ref.character[sprite].atlas;

        this.scene.load.once("complete", () => {
            this._data.sprite = sprite;
            this.rawSetSprite(sprite);
        }, this);

        this.scene.load.atlas(
            atlas,
            "assets/img/characters/" + atlas + ".png",
            "assets/res/" + atlas + ".json"
        );

        this.scene.load.start();
    }
};

export default RawCharacter;