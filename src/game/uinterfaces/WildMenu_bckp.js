import Layout from "@/game/managers/Layout";
import LayoutResponsivityManager from "@/game/managers/LayoutResponsivityManager";

import { RESOLUTION_TYPES } from "@/game/constants/Resolutions";

import { getResolution, addGenericUIComponent } from "@/game/utils";

import UInterfaceContainer from "./components/generics/UInterfaceContainer";
import Button from "./components/generics/Button";
import Rating from "./components/wildmenu/Rating";

class WildMenu extends UInterfaceContainer {                                                                                                                                                                                                                    
    constructor (scene) {
        super(scene, Layout.ref.get("wildEncounter"));
        scene.add.existing(this);
        //scene.plugins.get("rexDrag").add(this);
    }

    append () {
        this.background = addGenericUIComponent(this.layout.background, this.scene);
        this.nameBox = addGenericUIComponent(this.layout.nameBox, this.scene);
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
            rating: 3
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