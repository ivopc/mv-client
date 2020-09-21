// Libs próprias
import Button from "@/game/plugins/button";

// constantes das informações que o tooltip exibirá
const TOOLTIPTYPE = {
    CANT_SEE_SP: 0,
    CAN_SEE_SP: 1
};

const WildMenu = function (scene, data) {
    this.scene = scene;
    this.data = data;

    this.text = {};
    this.button = {};

    this.visible;
};

// Add interface do Wild Menu
WildMenu.prototype.append = function () {
    this.visible = true;
    const lang = this.scene.cache.json.get("language");
    this.wildTooltipType = this.data.canSeeSP ? TOOLTIPTYPE.CAN_SEE_SP : TOOLTIPTYPE.CANT_SEE_SP;

    this.wildBox = this.scene.add.sprite(0, this.scene.game.config.height - 47, "wild-box")
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.scene.containers.interface.add(this.wildBox);

    this.rating = this.scene.add.sprite(73, 211, "rating")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setFrame(this.scene.database.monsters[this.data.id].rating);
    this.scene.containers.interface.add(this.rating);

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
    this.button.battle.sprite.setScrollFactor(0);
    this.scene.containers.interface.add(this.button.battle.sprite);

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
                if (this.tooltipOppened)
                    this.clearTooltip();
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    this.button.run.sprite.setScrollFactor(0);
    this.scene.containers.interface.add(this.button.run.sprite);

    this.button.info = new Button(this.scene, {
        x: 233,
        y: 199,
        spritesheet: "info-button",
        on: {
            click: () => this.appendTooltip()
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    this.button.info.sprite.setScrollFactor(0);
    this.scene.containers.interface.add(this.button.info.sprite);

    this.text.battle = this.scene.add.text(0, 0, lang.prebattle["acceptbattle"][this.scene.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setX(this.button.battle.sprite.getCenter().x)
        .setY(this.button.battle.sprite.getCenter().y);
    this.button.battle.sprite.setScrollFactor(0);
    this.scene.containers.interface.add(this.text.battle);
    
    this.text.run = this.scene.add.text(0, 0, lang.prebattle["run"][this.scene.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setX(this.button.run.sprite.getCenter().x)
        .setY(this.button.run.sprite.getCenter().y);

    this.scene.containers.interface.add(this.text.run);

    this.text.name = this.scene.add.text(93, 205, this.scene.database.monsters[this.data.id].name, {
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setX(this.rating.getCenter().x);
    this.scene.containers.interface.add(this.text.name);
};

// Limpar/excluir interface
WildMenu.prototype.clear = function () {
    Object.keys(this.button).forEach(button => this.button[button].sprite.destroy());
    Object.keys(this.text).forEach(text => this.text[text].destroy());
    this.wildBox.destroy();
    this.rating.destroy();

    if (this.tooltipOppened)
        this.clearTooltip();

    this.visible = false;
};

// Add tooltip com infos do monstro
WildMenu.prototype.appendTooltip = function () {
    // se já tooltip estiver aberto remove o tooltip
    if (this.tooltipOppened) {
        this.clearTooltip();
        return;
    };

    this.tooltipOppened = true;

    // se pode ver os Singular Points do monstro
    if (this.data.canSeeSP) {
        this.wildTooltip = this.scene.add.sprite(
            226,
            31,
            "wild-tooltip-special"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0);
        this.scene.containers.interface.add(this.wildTooltip);

        this.wildHpIcon = this.scene.add.sprite(
            234,
            42,
            "icons"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setFrame("attr_hp");
        this.scene.containers.interface.add(this.wildHpIcon);

        this.wildAtkIcon = this.scene.add.sprite(
            236,
            67,
            "icons"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setFrame("attr_atk");
        this.scene.containers.interface.add(this.wildAtkIcon);

        this.wildDefIcon = this.scene.add.sprite(
            234,
            93,
            "icons"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setFrame("attr_def");
        this.scene.containers.interface.add(this.wildDefIcon);

        this.wildSpeIcon = this.scene.add.sprite(
            234,
            121,
            "icons"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setFrame("attr_spe");
        this.scene.containers.interface.add(this.wildSpeIcon);

        this.wildHpValue = this.scene.add.text(0, 0, this.data.hp, { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000"
        })
            .setX(this.wildHpIcon.x + this.wildHpIcon.displayWidth + 10)
            .setY(this.wildHpIcon.y)
            .setScrollFactor(0);
        this.scene.containers.interface.add(this.wildHpValue);

        this.wildAtkValue = this.scene.add.text(0, 0, this.data.atk, { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000"
        })
            .setX(this.wildAtkIcon.x + this.wildAtkIcon.displayWidth + 10)
            .setY(this.wildAtkIcon.y)
            .setScrollFactor(0);
        this.scene.containers.interface.add(this.wildAtkValue);

        this.wildDefValue = this.scene.add.text(0, 0, this.data.def, { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000"
        })
            .setX(this.wildDefIcon.x + this.wildDefIcon.displayWidth + 10)
            .setY(this.wildDefIcon.y)
            .setScrollFactor(0);
        this.scene.containers.interface.add(this.wildDefValue);

        this.wildSpeValue = this.scene.add.text(0, 0, this.data.spe, { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000"
        })
            .setX(this.wildSpeIcon.x + this.wildSpeIcon.displayWidth + 10)
            .setY(this.wildSpeIcon.y)
            .setScrollFactor(0);
        this.scene.containers.interface.add(this.wildSpeValue);

        this.wildLevelText = this.scene.add.text(232, 148, "Level: " + this.data.level, { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000" 
        })
            .setScrollFactor(0);
        this.scene.containers.interface.add(this.wildLevelText);

    } else {
        this.wildTooltip = this.containers.interface.sprite(
            224,
            140,
            "wild-tooltip"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0);
        this.scene.containers.interface.add(this.wildTooltip);

        this.wildLevelText = this.scene.add.text(232, 151, "Level: " + this.data.level, { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000" 
        })
            .setScrollFactor(0);
           
        this.scene.containers.interface.add(this.wildLevelText);
    };
};

// Limpar excluir tooltip
WildMenu.prototype.clearTooltip = function () {
    switch (this.wildTooltipType) {
        case TOOLTIPTYPE.CANT_SEE_SP: {
            this.wildTooltip.destroy();
            this.wildLevelText.destroy();
            break;
        };
        case TOOLTIPTYPE.CAN_SEE_SP: {
            this.wildTooltip.destroy();
            this.wildHpIcon.destroy();
            this.wildAtkIcon.destroy();
            this.wildDefIcon.destroy();
            this.wildSpeIcon.destroy();
            this.wildHpValue.destroy();
            this.wildAtkValue.destroy();
            this.wildDefValue.destroy();
            this.wildSpeValue.destroy();
            this.wildLevelText.destroy();
            break;
        };
    };

    this.tooltipOppened = false;
};

export default WildMenu;