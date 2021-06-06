import Phaser from "phaser";

class Monster extends Phaser.GameObjects.Sprite {
    constructor (scene, data, position) {
        super(scene, position.x, position.y);
        this._data = data;
        this.spriteData = this.scene.database.battle.sprites[this._data.monsterpedia_id];
        this.setTexture("monster_" + data.monsterpedia_id);
        this.addAnims();
        scene.add.existing(this);
    }

    addAnims () {
        const name = this.spriteData.name;
        const frames = {
            idle: [],
            attack: []
        };
        frames.idle = this.spriteData.animation.idle.map((anim, index) => ({
            key: this.spriteData.atlas,
            frame: name + "_idle" + (index)
        }));
        this.scene.anims.create({
            key: name + "_idle",
            frames: frames.idle,
            frameRate: this.spriteData.framerate.idle,
            repeat: -1
        });
        this.anims.load(name + "_idle");
        frames.attack = this.spriteData.animation.physicalattack.map((anim, index) => ({
            key: this.spriteData.atlas,
            frame: name + "_physicalattack" + (index)
        }));
        this.scene.anims.create({
            key: name + "_physicalattack",
            frames:frames.attack,
            frameRate: this.spriteData.framerate.physicalattack,
            repeat: 0
        });
        this.anims.load(name + "_physicalattack");
        this.on("animationcomplete", (anim, frame) =>
            this.emit("anim_" + anim.key.split("_")[1], anim, frame)
        );
        this.on("anim_physicalattack", () =>
            this.anims.play(name + "_idle")
        );
    }

    playAnim (anim) {
        //anim: idle|physicalattack
        this.anims.play(this.scene.database.battle.sprites[this._data.monsterpedia_id].name + "_" + anim);
    }
};

export default Monster;