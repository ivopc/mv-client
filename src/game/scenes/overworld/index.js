import Phaser from "phaser";

import { SCENE } from "@/game/constants/GameScene";

import { UIs, UI_STATES } from "@/game/constants/UI";

import LayoutResponsivityManager from "@/game/managers/LayoutResponsivityManager";

import RuntimeUI from "@/game/uinterfaces/RuntimeUI";

import Loader from "./Loader";

class Overworld extends Phaser.Scene {
    constructor () {
        super({ key: SCENE.OVERWORLD });
        Overworld.ref = this;
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
        // tests
        /*const party = new Party(this);
        party.append();
        window.party = party;
        /*const wild = new WildMenu(this);
        wild.append();
        window.wild = wild;
        this.plugins.get("rexDrag").add(wild);*/
        this.pingText = this.add.text(0, 0, "Ping:", {
            fontSize: 32,
            fontText: "Century Gothic",
            color: "#fff",
            backgroundColor: "#000"
        })
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setDepth(999999999); // {placeholder}
        this.addRuntimeUI("SelfProfile"); // {test}
    }

    addRuntimeUI (name) {
        const UI = UIs.find(ui => ui.name === name);
        const runtimeUI = UI.class ? new UI.class(this) : new RuntimeUI(this, UI.layout);
        runtimeUI.manager.addIdleBehavior();
        runtimeUI.append();
        window.runtimeUI = runtimeUI;
    }

    /**
     * Static reference to self `Overworld` scene instance
     * @type {Overworld}
     */
     static ref
};

export default Overworld;