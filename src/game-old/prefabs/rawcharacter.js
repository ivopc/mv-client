import Phaser from "phaser";

class RawCharacter extends Phaser.GameObjects.Sprite {
    constructor (scene, x, y, data) {
        super(scene, x, y, data);

        this.scene = scene;
        this._data = data;

        // verificando se sprite já foi carregada no client
        // se não for: manda carregar em assincronia e seta uma 
        // sprite placeholder e substituir pela carregada
        // quando terminar de carregar
        if (scene.textures.exists(scene.database.characters[data.sprite].atlas)) {
            this.rawSetSprite(data.sprite);
        } else {
            this.rawSetSprite(1);
            const sprite = data.sprite;
            this.loadAtlasAsync(sprite);
            this._data.sprite = 1;
        };
    }

    // Mudar sprite de forma crua
    rawSetSprite (sprite) {
        // seta textura
        this.setTexture(this.scene.database.characters[sprite].atlas);
        this.setFrame(this.scene.database.characters[sprite].name + "_" + this.scene.database.overworld.directions[this._data.position.facing] + "_idle0");

        // adiciona animação de idle para as 4 direções
        for (let i = 0, l = this.scene.database.overworld.directions.length; i < l; i++) {
            // criar animação idle para todos os lados
            this.scene.anims.create({
                key: this.scene.database.characters[sprite].name + "_idle_" + this.scene.database.overworld.directions[i],
                frames: [
                    {key: this.scene.database.characters[sprite].atlas, frame: this.scene.database.characters[sprite].name + "_" + this.scene.database.overworld.directions[i] + "_idle0"}, 
                    {key: this.scene.database.characters[sprite].atlas, frame: this.scene.database.characters[sprite].name + "_" + this.scene.database.overworld.directions[i] + "_idle1"}
                ],
                frameRate: 2,
                repeat: -1
            });

            // adiciona animação a sprite do player
            this.anims.load(this.scene.database.characters[sprite].name + "_idle_" + this.scene.database.overworld.directions[i]);
        };

        // play na animação idle
        this.anims.play(this.scene.database.characters[sprite].name + "_idle_" + this.scene.database.overworld.directions[this._data.position.facing]);
    }

    // mudar posição em relação ao próprio eixo
    changeOrigin (direction) {
        const origin = this.scene.database.characters[this._data.sprite].origin[this.scene.database.overworld.directions[direction]];
        this.setOrigin(origin.x, origin.y);
    }

    // carregar sprite em assincronia
    loadAtlasAsync (sprite) {
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