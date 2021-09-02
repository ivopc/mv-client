import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";
import TextStaticDatabase from "@/game/models/TextStaticDatabase";
import MonstersStaticDatabase from "@/game/models/MonstersStaticDatabase";

import LayoutResponsivityManager from "@/game/managers/LayoutResponsivityManager";
import SceneManager from "@/game/managers/SceneManager";

import { acceptBattle, rejectBattle } from "@/game/scenes/level/network/wild.network";

import { RESOLUTION_TYPES } from "@/game/constants/Resolutions";

import { getResolution, addGenericUIComponent } from "@/game/utils";
import { timedEvent } from "@/game/utils/scene.promisify";

import UInterfaceContainer from "./components/generics/UInterfaceContainer";
import Button from "./components/generics/Button";
import Rating from "./components/wildmenu/Rating";

import ScaleDownDestroy from "phaser3-rex-plugins/plugins/scale-down-destroy";
import FadeOutDestroy from "phaser3-rex-plugins/plugins/fade-out-destroy";

class WildMenu extends UInterfaceContainer {
    constructor (scene, monster) {
        super(scene, LayoutStaticDatabase.get("wildEncounter"));
        this.monsterData = monster;
        this.monsterInOverworld;
        scene.add.existing(this);
    }

    append () {
        const monsterInfo = MonstersStaticDatabase.get(this.monsterData.monsterpediaId);
        this.background = addGenericUIComponent(this.layout.background, this.scene);
        this.nameBox = addGenericUIComponent(this.layout.nameBox, this.scene);
        const { x, y } = this.nameBox.getCenter();
        this.monsterNameDisplay = this.scene.add.text(x, y, monsterInfo.name, this.layout.monsterNameDisplay).setOrigin(0.5);
        this.btnBattle = new Button(this.scene, {
            x: this.layout.btnBattle.position.x,
            y: this.layout.btnBattle.position.y,
            spritesheet: this.layout.btnBattle.spritesheet,
            frames: this.layout.btnBattle.frames,
            text: {
                display: TextStaticDatabase.get("prebattle", "acceptbattle"),
                style: this.layout.btnBattle.textStyle
            },
            on: {
                click: () => this.onAcceptBattle()
            }
        });
        this.btnRun = new Button(this.scene, {
            x: this.layout.btnRun.position.x,
            y: this.layout.btnRun.position.y,
            spritesheet: this.layout.btnRun.spritesheet,
            frames: this.layout.btnRun.frames,
            text: {
                display: TextStaticDatabase.get("prebattle", "tryrun"),
                style: this.layout.btnRun.textStyle
            },
            on: {
                click: () => this.onRejectBattle()
            }
        });
        this.ratingStars = new Rating(this.scene, monsterInfo.rating);
        this.ratingStars.setName(this.layout.ratingStars.name);
        this.setOriginalBaseSize(this.background);
        this.add([
            this.background, 
            this.nameBox, 
            this.monsterNameDisplay, 
            this.btnBattle, 
            this.btnRun, 
            this.ratingStars
        ]);
    }

    async onAcceptBattle () {
        const { $cameraController, $manager } = SceneManager.getLevel();
        const delay = 400; // {placeholder}
        ScaleDownDestroy(this, delay);
        FadeOutDestroy(this, delay);
        await timedEvent(delay, this.scene);
        await $cameraController.powerZoom(this.monsterInOverworld);
        const battleData = await acceptBattle();
        $manager.launchBattle(battleData);
    }

    onRejectBattle () {
        rejectBattle();
    }

    setMonsterInOverworld (gameObject) {
        this.monsterInOverworld = gameObject;
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