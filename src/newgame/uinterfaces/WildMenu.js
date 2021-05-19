import Phaser from "phaser";

import Layout from "@/newgame/managers/Layout";
import Button from "./components/Button";

class WildMenu extends Phaser.GameObjects.Container {
    constructor (scene) {
        super(scene);
        this.layout = Layout.ref.data.wildEncounter;
        scene.add.existing(this);
    }

    append () {
        this.background = this.scene.add.sprite(
            this.layout.background.x,
            this.layout.background.y,
            this.layout.background.texture
        )
        .setOrigin(0, 0);
        this.add(this.background);
        this.nameBox = this.scene.add.sprite(
            this.layout.nameBox.x,
            this.layout.nameBox.y,
            this.layout.nameBox.texture
        )
        .setOrigin(0, 0);
        this.add(this.nameBox);
        this.btnBattle = new Button(this.scene, {
            x: this.layout.btnBattle.x,
            y: this.layout.btnBattle.y,
            spritesheet: this.layout.btnBattle.spritesheet,
            frames: this.layout.btnBattle.frames,
            text: {
                display: "Batalhar",
                style: this.layout.btnBattle.textStyle
            },
            on: {
                click: () => {
                    console.log("OLÁ")
                }
            }
        });
        this.add(this.btnBattle);
        this.btnRun = new Button(this.scene, {
            x: this.layout.btnRun.x,
            y: this.layout.btnRun.y,
            spritesheet: this.layout.btnRun.spritesheet,
            frames: this.layout.btnRun.frames
        });
        this.add(this.btnRun);
    }
};

export default WildMenu;