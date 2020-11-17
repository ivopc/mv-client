import Phaser from "phaser";

class RawCharacter extends Phaser.GameObjects.Sprite {
    constructor (scene, x, y, data) {
        super(scene, x, y, data);

        this.scene = scene;
        this._data = data;

        // checking if sprite is already loaded, if don't we will load
        if (scene.textures.exists(scene.database.characters[data.sprite].atlas)) {
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
        this.setTexture(this.scene.database.characters[sprite].atlas);
        this.setFrame(this.scene.database.characters[sprite].name + "_" + this.scene.database.overworld.directions[this._data.position.facing] + "_idle0");


        // add anim to 4 character directions
        for (let i = 0, l = this.scene.database.overworld.directions.length; i < l; i++) {
            this.scene.anims.create({
                key: this.scene.database.characters[sprite].name + "_idle_" + this.scene.database.overworld.directions[i],
                frames: [
                    {key: this.scene.database.characters[sprite].atlas, frame: this.scene.database.characters[sprite].name + "_" + this.scene.database.overworld.directions[i] + "_idle0"}, 
                    {key: this.scene.database.characters[sprite].atlas, frame: this.scene.database.characters[sprite].name + "_" + this.scene.database.overworld.directions[i] + "_idle1"}
                ],
                frameRate: 2,
                repeat: -1
            });

            // add anim to character sprite
            this.anims.load(this.scene.database.characters[sprite].name + "_idle_" + this.scene.database.overworld.directions[i]);
        };

        // play on idle anim
        this.anims.play(this.scene.database.characters[sprite].name + "_idle_" + this.scene.database.overworld.directions[this._data.position.facing]);
    }

    changeOrigin (direction) {
        const origin = this.scene.database.characters[this._data.sprite].origin[this.scene.database.overworld.directions[direction]];
        this.setOrigin(origin.x, origin.y);
    }

    loadSpriteAsync (sprite) {
        const atlas = this.scene.database.characters[sprite].atlas;

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