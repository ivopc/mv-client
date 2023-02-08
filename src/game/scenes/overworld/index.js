import { Scene } from "phaser";

import { SCENE } from "@/game/constants/GameScene";

import { UIs, UI_STATES } from "@/game/constants/UI";

import LayoutResponsivityManager from "@/game/managers/LayoutResponsivityManager";
import SceneManager from "@/game/managers/SceneManager";

import Party from "@/game/uinterfaces/Party";
import WildMenu from "@/game/uinterfaces/WildMenu";

import Monster from "@/game/prefabs/Monster";
import PlayerModel from "@/game/models/PlayerModel";

import Loader from "./Loader";

class Overworld extends Scene {
    constructor () {
        super({ key: SCENE.OVERWORLD });
        SceneManager.setOverworld(this);
    }

    init (params) {}

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {
        this.scene.launch(SCENE.LEVEL);
        this.scene.bringToTop();
        LayoutResponsivityManager.addListener();
        console.log(PlayerModel.partyMonsters);
        // tests
        /*const party = new Party(this);
        party.append();
        window.party = party;*/
        /*const wild = new WildMenu(this);
        wild.append();
        window.wild = wild;*/
        //this.plugins.get("rexDrag").add(wild);
        this.pingText = this.add.text(0, 0, "Ping:", {
            fontSize: 32,
            fontText: "Century Gothic",
            color: "#fff",
            backgroundColor: "#000"
        })
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(999999999); // {placeholder}
        this.pingText.visible = false;
        /*const monster = new Monster(
            this,
            PlayerModel.partyMonsters.get(0),
            {
                x: 1280 / 2,
                y: 720 / 2
            }
        );
        monster.playAnim("idle");
        monster.scale = 4;*/

        // MonsterStatus | Profile | Bag | InitialMonster
        //this.addRuntimeUI("InitialMonster"); // {test}
        //this.startDevelopMode();
    }

    async addRuntimeUI (name) {
        const UI = UIs.find(ui => ui.name === name);
        const runtimeUIImport = await import("@/game/uinterfaces/" + UI.name);
        const runtimeUI = new runtimeUIImport.default(this, UI.layout);
        runtimeUI.manager.addIdleBehavior();
        if (runtimeUI.hasWindows)
            runtimeUI.manager.addWindowsBehavior();
        runtimeUI.append();
        this.runtimeUI = runtimeUI;
    }

    async startDevelopMode () {
        if (process.env.NODE_ENV !== "development")
            return;
        const [ debugstarter, _engineIniter ] = await Promise.all([
            import("@/game/debug/DebugStarter"),
            import("@/game/engine")
        ]);
        const DebugStarter = debugstarter.default;
        const engineIniter = _engineIniter.default;
        DebugStarter.setup(this.game);
        engineIniter(this);
    }
};

export default Overworld;