import Phaser from "phaser";

// Libs próprias
import Button from "@/game/plugins/button";

const TOOLTIPTYPE = {
    CANT_SEE_SP: 0,
    CAN_SEE_SP: 1
};

class WildMenu extends Phaser.GameObjects.Container {
    constructor (scene, x, y, children) {
        super(scene, 0, 0, children);

        this.scene = scene;
        this.text = {};
        this.button = {};

        this.setScrollFactor(0);
        scene.add.existing(this);

        this.setInteractive();

        //this.bringToTop();
    }

    append (data) {
        const lang = this.scene.cache.json.get("language");
        this.wildTooltipType = data.canSeeSP ? TOOLTIPTYPE.CAN_SEE_SP : TOOLTIPTYPE.CANT_SEE_SP;

        this.wildBox = this.scene.add.sprite(0, this.scene.game.config.height - 47, "wild-box")
            .setOrigin(0, 0);

        this.add(this.wildBox);

        this.button.battle = new Button(this.scene, {
            x: 272,
            y: 200,
            spritesheet: "battle-button",
            on: {
                click: () => {
                    this.scene.addLoader();
                    this.scene.acceptRejectWildBattle(1);
                    this.button.battle.sprite.input.enabled = false;
                    this.button.run.sprite.input.enabled = false;
                }
            },
            frames: {click: 1, over: 2, up: 0, out: 0}
        });
        console.log(this.button.battle);
        //this.add(this.button.battle.sprite);

        this.button.run = new Button(this.scene, {
            x: 375,
            y: 200,
            spritesheet: "run-button",
            on: {
                click: () => {
                    // enviar ao servidor que tentou fugir
                    this.scene.acceptRejectWildBattle(0);

                    // desabilita botões pra não enviar mais de uma request
                    this.button.battle.sprite.input.enabled = false;
                    this.button.run.sprite.input.enabled = false;

                    this.scene.addLoader();

                    // se o tooltip estiver aberto remove
                    if (this.wildTooltipOppened)
                        this.clearTooltip();
                }
            },
            frames: {click: 1, over: 2, up: 0, out: 0}
        });

        this.add(this.button.run.sprite);

        this.button.info = new Button(this.scene, {
            x: 233,
            y: 199,
            spritesheet: "info-button",
            on: {
                click: () => this.appendTooltip(data)
            },
            frames: {click: 1, over: 2, up: 0, out: 0}
        });

        this.add(this.button.info.sprite);

        this.text.battle = this.scene.add.text(0, 0, lang.prebattle["acceptbattle"][this.scene.lang], { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        })
            .setOrigin(0.5)
            .setX(this.button.battle.sprite.getCenter().x)
            .setY(this.button.battle.sprite.getCenter().y);

        this.add(this.text.battle);
        
        this.text.run = this.scene.add.text(0, 0, lang.prebattle["run"][this.scene.lang], { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        })
            .setOrigin(0.5)
            .setX(this.button.run.sprite.getCenter().x)
            .setY(this.button.run.sprite.getCenter().y);

        this.add(this.text.run);

        this.text.name = this.scene.add.text(93, 205, this.scene.database.monsters[data.id].name, {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        })
            .setOrigin(0.5);

        this.add(this.text.name);

        this.rating = this.scene.add.sprite(73, 211, "rating")
            .setOrigin(0, 0)
            .setFrame(this.scene.database.monsters[data.id].rating);

        this.add(this.rating);

        this.text.name.setX(this.rating.getCenter().x);

        //this.bringToTop();

        //Object.keys(this.button).forEach(btn => this.bringToTop(btn.spri));
    }

    appendTooltip (data) {
        // se já estiver aberto remove o tooltip
        if (this.wildTooltipOppened) {
            this.clearTooltip();
            return;
        };

        this.tooltipContainer = this.scene.add.container();

        this.add(this.tooltipContainer);

        this.wildTooltipOppened = true;

        // se pode ver os Singular Points
        if (data.canSeeSP) {
            this.wildTooltip = this.scene.add.sprite(
                226,
                31,
                "wild-tooltip-special"
            )
                .setOrigin(0, 0);
            this.tooltipContainer.add(this.wildTooltip);


            this.wildHpIcon = this.scene.add.sprite(
                234,
                42,
                "icons"
            )
                .setOrigin(0, 0)
                .setFrame("attr_hp");
            this.tooltipContainer.add(this.wildHpIcon);

            this.wildAtkIcon = this.scene.add.sprite(
                236,
                67,
                "icons"
            )
                .setOrigin(0, 0)
                .setFrame("attr_atk");
            this.tooltipContainer.add(this.wildAtkIcon);

            this.wildDefIcon = this.scene.add.sprite(
                234,
                93,
                "icons"
            )
                .setOrigin(0, 0)
                .setFrame("attr_def");
            this.tooltipContainer.add(this.wildDefIcon);

            this.wildSpeIcon = this.scene.add.sprite(
                234,
                121,
                "icons"
            )
                .setOrigin(0, 0)
                .setFrame("attr_spe");
            this.tooltipContainer.add(this.wildSpeIcon);

            this.wildHpValue = this.scene.add.text(0, 0, data.hp, { 
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#000"
            })
                .setX(this.wildHpIcon.x + this.wildHpIcon.displayWidth + 10)
                .setY(this.wildHpIcon.y);
            this.tooltipContainer.add(this.wildHpValue);

            this.wildAtkValue = this.scene.add.text(0, 0, data.atk, { 
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#000"
            })
                .setX(this.wildAtkIcon.x + this.wildAtkIcon.displayWidth + 10)
                .setY(this.wildAtkIcon.y);
            this.tooltipContainer.add(this.wildAtkValue);

            this.wildDefValue = this.scene.add.text(0, 0, data.def, { 
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#000"
            })
                .setX(this.wildDefIcon.x + this.wildDefIcon.displayWidth + 10)
                .setY(this.wildDefIcon.y);
            this.tooltipContainer.add(this.wildDefValue);

            this.wildSpeValue = this.scene.add.text(0, 0, data.spe, { 
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#000"
            })
                .setX(this.wildSpeIcon.x + this.wildSpeIcon.displayWidth + 10)
                .setY(this.wildSpeIcon.y);
            this.tooltipContainer.add(this.wildSpeValue);

            this.wildLevelText = this.scene.add.text(232, 148, "Level: " + data.level, { 
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#000" 
            });
            this.tooltipContainer.add(this.wildLevelText);

        } else {
            this.wildTooltip = this.add.sprite(
                224,
                140,
                "wild-tooltip"
            )
                .setOrigin(0, 0);
            this.tooltipContainer.add(this.wildTooltip);

            this.wildLevelText = this.scene.add.text(232, 151, "Level: " + data.level, { 
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#000" 
            });
               
            this.tooltipContainer.add(this.wildLevelText);
        };
    }

    clearTooltip () {
        this.tooltipContainer.destroy();
        this.wildTooltipOppened = false;
    }
};

export default WildMenu;