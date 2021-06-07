import Phaser from "phaser";

import { RESOLUTION_TYPES } from "@/newgame/constants/Resolutions";

import Layout from "@/newgame/managers/Layout";
import LayoutResponsivityManager from "@/newgame/managers/LayoutResponsivityManager";

import { getResolution, addGenericUIComponent } from "@/newgame/utils";

import InterfaceContainer from "./components/InterfaceContainer";
import Button from "./components/Button";
import Rating from "./components/wildmenu/Rating";

class WildMenu extends InterfaceContainer {                                                                                                                                                                                                                      
    constructor (scene) {
        super(scene, Layout.ref.get("wildEncounter"));
        scene.add.existing(this);
        //scene.plugins.get("rexDrag").add(this);
    }

    append () {
        this.background = addGenericUIComponent(this.scene, this.layout.background);
        this.nameBox = addGenericUIComponent(this.scene, this.layout.nameBox);
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
        if (displaySize.width <= getResolution(RESOLUTION_TYPES.MOBILE).width) {
            LayoutResponsivityManager.fitToFullScreen(this, this.originalSize, gameSize);
        } else {
            LayoutResponsivityManager.normalizeGameObject(this);
        };
    }
};

export default WildMenu;