import { GameObjects } from "phaser";

import { getResolution, addGenericUIComponent } from "@/game/utils";
import { BATTLE_MENU_STATES, BATTLE_MOVE_TYPES_TEXTURE } from "@/game/constants/Battle";

import TextStaticDatabase from "@/game/models/TextStaticDatabase";
import PlayerModel from "@/game/models/PlayerModel";
import MovesStaticDatabase from "@/game/models/MovesStaticDatabase";

import Button from "../generics/Button";
import AnimatedDialogText from "../generics/AnimatedDialogText";

class ActionMenu extends GameObjects.Container {
    constructor (scene, layout) {
        super(scene);
        this.layout = layout;
        this.currentState = BATTLE_MENU_STATES.IDLE;
        this.actionsText;
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
        this.add([
            this.btnBattle,
            this.btnBag,
            this.btnParty,
            this.btnRun 
        ]);
    }

    addFightMenu () {
        this.clearContent();
        this.setState(BATTLE_MENU_STATES.FIGHT);
        const { fightMenu } = this.layout;
        const { moves } = PlayerModel.partyMonsters.firstAlive;
        console.log("seus moves", moves);
        this.movesBtn = moves.map((move, index) => {
            const moveData = MovesStaticDatabase.getById(move);
            const button = new Button(this.scene, {
                x: fightMenu.movesBtn.list[index].position.x,
                y: fightMenu.movesBtn.list[index].position.y,
                spritesheet: this.getMoveButtonSpritesheet(moveData),
                frames: fightMenu.movesBtn.frames,
                text: {
                    display: moveData ? moveData.name[TextStaticDatabase.lang] : "-",
                    style: fightMenu.movesBtn.textStyle
                },
                on: {
                    click: () => console.log("clicou no move", index)
                }
            });
            if (!moveData)
                button.setEnabled(false);
            return button;
        });
        this.fightBackBtn = new Button(this.scene, {
            x: fightMenu.backBtn.position.x,
            y: fightMenu.backBtn.position.y,
            spritesheet: fightMenu.backBtn.spritesheet,
            frames: fightMenu.backBtn.frames,
            on: {
                click: () => this.addChoiceMenu()
            }
        });
        this.add([ this.fightBackBtn ]);
    }

    addPartyMenu () {}

    addBagMenu () {}

    async addText () {
        this.actionsText = new AnimatedDialogText(this.scene, 
            {
                br: [
                    "UMA COISA DIFERENTE UMA COISA DIFERENTE",
                    "CERTAMENTE ACONTECE CERTAMENTE ACONTECE",
                    "É SEQUENCIA DO GRAVE, É SEQUENCIA DO GRAVE",
                    "QUANDO EU CANTO O BAILE ESTREMECE",
                    "UMA COISA DIFERENTE UMA COISA DIFERENTE2",
                    "CERTAMENTE ACONTECE CERTAMENTE ACONTECE2",
                    "É SEQUENCIA DO GRAVE, É SEQUENCIA DO GRAVE2",
                    "QUANDO EU CANTO O BAILE ESTREMECE2"
                ]
            },
        {
            x: this.layout.actionsText.position.x,
            y: this.layout.actionsText.position.y,
            fontFamily: this.layout.actionsText.fontFamily,
            color: this.layout.actionsText.color,
            fontSize: this.layout.actionsText.fontSize
        });
        this.add(this.actionsText);
        this.actionsText.setAnimationTimer();
        await this.actionsText.waitForEnd();
        console.log("TESTE");
    }

    getMoveButtonSpritesheet (moveData) {
        if (!moveData) {
            return BATTLE_MOVE_TYPES_TEXTURE["null"];
        };
        return BATTLE_MOVE_TYPES_TEXTURE[moveData.type];
    }

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
                this.movesBtn.forEach(button => button.destroy());
                this.fightBackBtn.destroy();
                break;
            };
        };
    }

    setState (state) {
        this.currentState = state;
    }

    get 
};

export default ActionMenu;