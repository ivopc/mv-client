import { GameObjects } from "phaser";

import MonstersStaticDatabase from "@/game/models/MonstersStaticDatabase";

class Monster extends GameObjects.Sprite {
    constructor (scene, data, position) {
        super(scene, position.x, position.y);
        this._data = data;
        this.database = MonstersStaticDatabase.get(data.monsterpedia_id);
        this.animName = this.database.name.toLowerCase();
        this.setTexture("monster_" + data.monsterpedia_id);
        this.addAnims();
        scene.add.existing(this);
    }

    addAnims () {
        const { name, animation, atlas, framerate } = this.database;
        const { animName } = this;
        this.scene.anims.create({
            key: animName + "_idle",
            frames: [ ... Array(animation.idle)].map((anim, index) => ({
                key: atlas,
                frame: animName + "_idle" + (index)
            })),
            frameRate: framerate.idle,
            repeat: -1
        });
        this.anims.load(animName + "_idle");
        this.scene.anims.create({
            key: animName + "_physicalattack",
            frames: [ ... Array(animation.physicalattack)].map((anim, index) => ({
                key: atlas,
                frame: animName + "_physicalattack" + (index)
            })),
            frameRate: framerate.physicalattack,
            repeat: 0
        });
        this.anims.load(animName + "_physicalattack");
        this.on("animationcomplete", (anim, frame) =>
            this.emit("anim_" + anim.key.split("_")[1], anim, frame)
        );
        this.on("anim_physicalattack", () =>
            this.anims.play(animName + "_idle")
        );
    }

    playAnim (anim) {
        //anim: idle|physicalattack
        this.anims.play(this.animName + "_" + anim);
    }
};

export default Monster;
