import Phaser from "phaser";

import Layout from "@/newgame/managers/Layout";

import InterfaceContainer from "./components/InterfaceContainer";
import Button from "./components/Button";
import Rating from "./components/wildmenu/Rating";

class WildMenu extends InterfaceContainer {
    constructor (scene) {
        super(scene, Layout.ref.data.wildEncounter);
        scene.add.existing(this);
        //scene.plugins.get("rexDrag").add(this);
    }

    append () {
        this.background = this.scene.add.sprite(
            this.layout.background.position.x,
            this.layout.background.position.y,
            this.layout.background.texture
        )
            .setOrigin(0)
            .setName(this.layout.background.name);
        this.nameBox = this.scene.add.sprite(
            this.layout.nameBox.position.x,
            this.layout.nameBox.position.y,
            this.layout.nameBox.texture
        )
            .setOrigin(0)
            .setName(this.layout.nameBox.name);
        this.btnBattle = new Button(this.scene, {
            x: this.layout.btnBattle.position.x,
            y: this.layout.btnBattle.position.y,
            spritesheet: this.layout.btnBattle.spritesheet,
            frames: this.layout.btnBattle.frames,
            text: {
                display: "Batalhar",
                style: this.layout.btnBattle.textStyle
            },
            on: {
                click: () => {
                    console.log("OLÁ, CLICOU NO BUTTON DE BATALHAR");
                }
            }
        });
        this.btnRun = new Button(this.scene, {
            x: this.layout.btnRun.position.x,
            y: this.layout.btnRun.position.y,
            spritesheet: this.layout.btnRun.spritesheet,
            frames: this.layout.btnRun.frames,
            text: {
                display: "Tentar Fugir",
                style: this.layout.btnRun.textStyle
            },
            on: {
                click: () => {
                    console.log("CLICOU NO BUTTON DE FUGIR CRL!");
                }
            }
        });
        this.ratingStars = new Rating(this.scene, this.monsterData.rating);
        this.ratingStars.setName(this.layout.ratingStars.name);
        this.add(this.background);
        this.add(this.nameBox);
        this.add(this.btnBattle);
        this.add(this.btnRun);
        this.add(this.ratingStars);
        this.setOriginalBaseSize(this.background);
    }

    get monsterData () {
        return {
            rating: 1
        }
    }

    resize (gameSize, baseSize, displaySize, previousWidth, previousHeight) {
        if (displaySize.width <= 480) {
            const scale = {
                x: gameSize.width / this.originalSize.width,
                y: gameSize.height / this.originalSize.height
            };
            const remainderX = scale.x < 1 ? 1 - scale.x : 0;
            this.scaleX = scale.x + remainderX;
            this.scaleY = Math.max(scale.x, scale.y);
            console.log("dimension authenticity scale test", {
                widthWithScale: this.originalSize.width * this.scaleX, 
                heightWithScale: this.originalSize.height * this.scaleY
            });
            this.setPosition(0, 0);
        } else {
            this.scale = 1;
            this.normalizePosition();
        };
    }
};

export default WildMenu;