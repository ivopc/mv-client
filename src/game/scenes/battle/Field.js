import { GameObjects } from "phaser";

import PlayerModel from "@/game/models/PlayerModel";
import BattleModel from "@/game/models/BattleModel";
import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";
import AssetsStaticDatabase from "@/game/models/AssetsStaticDatabase";

import Monster from "@/game/prefabs/Monster";

import { FIELD_TYPE_STR } from "@/game/constants/Battle";

class Field extends GameObjects.Container {
    constructor (scene) {
        super(scene);
        this.layout = LayoutStaticDatabase.get("battle");
        this.field;
        this.floorLeft;
        this.floorRight;
        this.monsterLeft;
        this.monsterRight;
        scene.add.existing(this);
    }

    addField () {
        const fieldKey = AssetsStaticDatabase.getBattleField(BattleModel.props.field_category);
        this.field = this.scene.add.sprite(0, 0, fieldKey).setOrigin(0);
        this.add(this.field);
    }


    addFloors () {
        const floorKey = AssetsStaticDatabase.getBattleFloor(BattleModel.props.field_category);
        const floorLayoutCategory = FIELD_TYPE_STR[BattleModel.props.field_category];
        const floorLayout = this.layout.floor[floorLayoutCategory].x1;
        this.floorLeft = this.scene.add.sprite(
            floorLayout[0].x,
            floorLayout[0].y,
            floorKey
        ).setOrigin(0);
        this.floorRight = this.scene.add.sprite(
            floorLayout[1].x,
            floorLayout[1].y,
            floorKey
        ).setOrigin(0);
        this.add([ this.floorLeft, this.floorRight ]);
    }

    addMonsters () { 
        const playerMonster = this.addMonsterRaw(this.floorLeft, PlayerModel.partyMonsters.firstAlive);
        const monsterOpponent = this.addMonsterRaw(this.floorRight, BattleModel.getCurrentOpponentMonster());
        this.monsterLeft = playerMonster;
        this.monsterRight = monsterOpponent;
        this.monsterRight.flipX = true;
        this.add([ playerMonster, monsterOpponent ]);
    }

    addMonsterRaw (floor, monsterData) {
        const monster = new Monster(this.scene, monsterData, { x: 0, y: 0 });
        monster.playAnim("idle");
        monster.scale = 3;
        const { x, y } = floor.getCenter();
        monster.setPosition(x, y - monster.displayHeight + (floor.displayHeight / 2));
        monster.setOrigin(0.5, 0);
        return monster;
    }

    addToMainContainer () {
        this.scene.$containers.main.add(this);
    }
};

export default Field;