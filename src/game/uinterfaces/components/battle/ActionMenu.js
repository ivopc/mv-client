import { GameObjects } from "phaser";

import { getResolution, addGenericUIComponent } from "@/game/utils";
import { BATTLE_MENU_STATES } from "@/game/constants/Battle";

import TextStaticDatabase from "@/game/models/TextStaticDatabase";

import Button from "../generics/Button";

class ActionMenu extends GameObjects.Container {
    constructor (scene, layout) {
        super(scene);
        this.layout = layout;
        this.currentState = BATTLE_MENU_STATES.IDLE;
        scene.add.existing(this);
    }

    addBase () {
        this.base = addGenericUIComponent(this.layout.actionMenu.base, this.scene);
        this.add(this.base);
    }

    addChoiceMenu () {
        if (this.currentState !== BATTLE_MENU_STATES.IDLE) {
            this.clearContent();
        };
        this.setState(BATTLE_MENU_STATES.IDLE);
        const { actionMenu } = this.layout;
        this.btnBattle = new Button(this.scene, {
            x: actionMenu.fightBtn.position.x,
            y: actionMenu.fightBtn.position.y,
            spritesheet: actionMenu.fightBtn.spritesheet,
            frames: actionMenu.fightBtn.frames,
            text: {
                display: TextStaticDatabase.get("battle", "btnbattle"),
                style: actionMenu.fightBtn.textStyle
            },
            on: {
                click: () => this.addFightMenu()
            }
        });
        this.btnBag = new Button(this.scene, {
            x: actionMenu.bagBtn.position.x,
            y: actionMenu.bagBtn.position.y,
            spritesheet: actionMenu.bagBtn.spritesheet,
            frames: actionMenu.bagBtn.frames,
            text: {
                display: TextStaticDatabase.get("battle", "btnbag"),
                style: actionMenu.bagBtn.textStyle
            },
            on: {
                click: () => console.log("bagBtn")
            }
        });
        this.btnParty = new Button(this.scene, {
            x: actionMenu.partyBtn.position.x,
            y: actionMenu.partyBtn.position.y,
            spritesheet: actionMenu.partyBtn.spritesheet,
            frames: actionMenu.partyBtn.frames,
            text: {
                display: TextStaticDatabase.get("battle", "btnmonsters"),
                style: actionMenu.partyBtn.textStyle
            },
            on: {
                click: () => console.log("partyBtn")
            }
        });
        this.btnRun = new Button(this.scene, {
            x: actionMenu.runBtn.position.x,
            y: actionMenu.runBtn.position.y,
            spritesheet: actionMenu.runBtn.spritesheet,
            frames: actionMenu.runBtn.frames,
            text: {
                display: TextStaticDatabase.get("battle", "btnrun"),
                style: actionMenu.partyBtn.textStyle
            },
            on: {
                click: () => console.log("runBtn")
            }
        });
    }

    addFightMenu () {
        this.clearContent();
        this.setState(BATTLE_MENU_STATES.FIGHT);
        const { fightMenu } = this.layout;
        this.fightBackBtn = new Button(this.scene, {
            x: fightMenu.backBtn.position.x,
            y: fightMenu.backBtn.position.y,
            spritesheet: fightMenu.backBtn.spritesheet,
            frames: fightMenu.backBtn.frames,
            on: {
                click: () => this.addChoiceMenu()
            }
        });
    }

    addPartyMenu () {}

    addItemsMenu () {}

    clearContent () {
        switch (this.currentState) {
            case BATTLE_MENU_STATES.IDLE: {
                this.btnBattle.destroy();
                this.btnBag.destroy();
                this.btnParty.destroy();
                this.btnRun.destroy();
                break;
            };
            case BATTLE_MENU_STATES.FIGHT: {
                this.fightBackBtn.destroy();
                break;
            };
        };
    }

    setState (state) {
        this.currentState = state;
    }
};

export default ActionMenu;