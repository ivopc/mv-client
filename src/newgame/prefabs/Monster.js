import Phaser from "phaser";

class Monster extends Phaser.GameObjects.Sprite {
    constructor (scene, data, position) {
        super(scene, position.x, position.y);

        this.scene = scene;
        this._data = data;

        this.setTexture("monster_" + data.monsterpediaId);
        this.addAnims();

        scene.add.existing(this);
    }

    addAnims () {
        const 
            inDbData = this.scene.database.battle.sprites[this._data.monsterpediaId],
            name = inDbData.name;

        const frames = {
            idle: [],
            attack: []
        };

        for (let i = 0; i < inDbData.animation.idle; i++) {
            frames.idle[i] = {
                key: inDbData.atlas,
                frame: name + "_idle" + (i)
            };
        };

        this.scene.anims.create({
            key: name + "_idle",
            frames: frames.idle,
            frameRate: inDbData.framerate.idle,
            repeat: -1
        });

        this.anims.load(name + "_idle");

        for (let i = 0; i < inDbData.animation.physicalattack; i++) {
            frames.attack[i] = {
                key: inDbData.atlas,
                frame: name + "_physicalattack" + (i)
            };
        };

        this.scene.anims.create({
            key: name + "_physicalattack",
            frames:frames.attack,
            frameRate: inDbData.framerate.physicalattack,
            repeat: 0
        });

        this.anims.load(name + "_physicalattack");

        this.on("animationcomplete", function (anim, frame) {
            this.emit("anim_" + anim.key.split("_")[1], anim, frame);
        });

        this.on("anim_physicalattack", function () {
            this.anims.play(name + "_idle");
        });
    }

    playAnim (anim) {
        //anim: idle|physicalattack
        this.anims.play(this.scene.database.battle.sprites[this._data.monsterpediaId].name + "_" + anim);
    }
};

export default Monster;