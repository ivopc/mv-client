import Phaser from "phaser";

import PlayerModel from "@/game/models/PlayerModel";
import BattleModel from "@/game/models/BattleModel";
import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";
import AssetsStaticDatabase from "@/game/models/AssetsStaticDatabase";

import Monster from "@/game/prefabs/Monster";

import { FIELD_TYPE_STR } from "@/game/constants/Battle";
import { MONSTER_IN_BATTLE_SCALE, MONSTER_IN_BATTLE_ORIGIN } from "@/game/constants/Monster";

class Field extends Phaser.GameObjects.Container {
    constructor (scene) {
        super(scene);
        this.layout = LayoutStaticDatabase.get("battle");
        this.field;
        this.left = scene.add.container();
        this.right = scene.add.container();
        /**
         * @type {Phaser.GameObjects.Sprite}
         */
        this.floorLeft;
        /**
         * @type {Phaser.GameObjects.Sprite}
         */
        this.floorRight;
        /**
         * @type {Monster}
         */
        this.monsterLeft;
        /**
         * @type {Monster}
         */
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
        [ this.floorLeft, this.floorRight ] = floorLayout.map(floor => this.scene.add.sprite(
            floor.x,
            floor.y,
            floorKey
        ).setOrigin(0));
    }

    addMonsters () {
        const playerMonster = this.addMonsterRaw(this.floorLeft, PlayerModel.partyMonsters.firstAlive);
        const monsterOpponent = this.addMonsterRaw(this.floorRight, BattleModel.getCurrentOpponentMonster());
        this.monsterLeft = playerMonster;
        this.monsterRight = monsterOpponent;
        this.monsterRight.flipX = true;
        this.addSidesContainers();
    }

    /**
     * 
     * @param {Phaser.GameObjects.Sprite} floor 
     * @param {JSON} monsterData 
     * @returns {Monster}
     */
    addMonsterRaw (floor, monsterData) {
        const monster = new Monster(this.scene, monsterData, { x: 0, y: 0 });
        monster.playAnim("idle");
        monster.scale = MONSTER_IN_BATTLE_SCALE;
        const { x, y } = floor.getCenter();
        monster.setPosition(x, y - monster.displayHeight + (floor.displayHeight / 2));
        monster.setOrigin(MONSTER_IN_BATTLE_ORIGIN.x, MONSTER_IN_BATTLE_ORIGIN.y);
        return monster;
    }

    addSidesContainers () {
        this.left.add([ this.floorLeft, this.monsterLeft ]);
        this.right.add([ this.floorRight, this.monsterRight ]);
        this.add([ this.left, this.right ]);
    }

    addToMainContainer () {
        this.scene.$containers.main.add(this);
    }
};

export default Field;