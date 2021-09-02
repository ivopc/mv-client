import { GameObjects } from "phaser";

import { HUD_TYPES, HUD_TYPES_STR } from "@/game/constants/Battle";

import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";
import PlayerModel from "@/game/models/PlayerModel";
import BattleModel from "@/game/models/BattleModel";

import PointsBar from "../generics/PointsBar";

class HUD extends GameObjects.Container {
    constructor (scene, type) {
        super(scene);
        this.base;
        this.healthBar;
        this.manaBar;
        this.expBar;
        this.monster;
        this.type = type;
        this.typeStr = HUD_TYPES_STR[type];
        this.layout = LayoutStaticDatabase.get("battle").monsterHud.x1[this.typeStr];
        this.setMonsterData();
        scene.add.existing(this);
    }

    append () {
        this.addBase();
        this.addName();
        this.addLevel();
        switch (this.type) {
            case HUD_TYPES.PLAYER: {
                this.addHealthBar();
                this.addManaBar();
                this.addExpBar();
                break;
            };
            case HUD_TYPES.OPPONENT: {
                this.addHealthBar();
                break;
            };
        };
    }

    addBase () {
        this.base = this.scene.add.sprite(
            this.layout.base.position.x,
            this.layout.base.position.y,
            this.layout.base.texture
        ).setOrigin(0);
        this.add(this.base);
    }

    addHealthBar () {
        this.healthBar = new PointsBar(this.scene, {
            x: this.layout.healthBar.position.x,
            y: this.layout.healthBar.position.y,
            width: this.layout.healthBar.width,
            height: this.layout.healthBar.height,
            barColor: this.layout.healthBar.color.bar,
            bgColor: this.layout.healthBar.color.bg
        });
        this.healthBar.addFrame(this.layout.healthBarFrame.texture);
        this.healthBar.addIcon(this.layout.healthBarIcon);
        this.add(this.healthBar);
    }

    addManaBar () {
        this.manaBar = new PointsBar(this.scene, {
            x: this.layout.manaBar.position.x,
            y: this.layout.manaBar.position.y,
            width: this.layout.manaBar.width,
            height: this.layout.manaBar.height,
            barColor: this.layout.manaBar.color.bar,
            bgColor: this.layout.manaBar.color.bg
        });
        this.manaBar.addFrame(this.layout.manaBarFrame.texture);
        this.manaBar.addIcon(this.layout.manaBarIcon);
        this.add(this.manaBar);
    }

    addExpBar () {
        this.expBar = new PointsBar(this.scene, {
            x: this.layout.expBar.position.x,
            y: this.layout.expBar.position.y,
            width: this.layout.expBar.width,
            height: this.layout.expBar.height,
            barColor: this.layout.expBar.color.bar,
            bgColor: this.layout.expBar.color.bg
        });
        this.expBar.addFrame(this.layout.expBarFrame.texture);
        //this.expBar.addIcon(this.layout.expBarIcon); // {todo}
        this.add(this.expBar);
    }

    addName () {
        const { name } = this.layout.text;
        this.scene.add.text(
            name.position.x,
            name.position.y, 
            this.monster.getName(),
            {
                fontFamily: name.fontFamily,
                fontSize: name.fontSize,
                color: name.color
            }
        );
    }

    addLevel () {
        const { level } = this.layout.text;
        this.scene.add.text(
            level.position.x,
            level.position.y, 
            "Lv. " + this.monster.level,
            {
                fontFamily: level.fontFamily,
                fontSize: level.fontSize,
                color: level.color
            }
        );
    }

    setMonsterData () {
        switch (this.type) {
            case HUD_TYPES.PLAYER: {
                this.monster = PlayerModel.partyMonsters.firstAlive;
                break;
            };
            case HUD_TYPES.OPPONENT: {
                this.monster = BattleModel.getCurrentOpponentMonster();
                break;
            };
        };
    }

    async setHealth () {}

    async setMana () {}

    async setExp () {}
};

export default HUD;