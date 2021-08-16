import SceneManager from "@/game/managers/SceneManager";

import Character from "@/game/prefabs/Character";

import { DIRECTIONS_HASH } from "@/game/constants/Overworld";
import { CHAR_TYPES } from "@/game/constants/Character";

import MonstersStaticDatabase from "@/game/models/MonstersStaticDatabase";

import WildMenu from "@/game/uinterfaces/WildMenu";

import { requestWildEncounter } from "./network/wild.network";

class Wild {
    constructor (scene) {
        this.scene = scene;
    }

    async requestEncounter () {
        const encounterData = await requestWildEncounter();
        this.dispatchEncounter(encounterData);
    }

    dispatchEncounter (payload) {
        const overworldScene = SceneManager.getOverworld();
        const menu = new WildMenu(overworldScene, payload);
        const monster = MonstersStaticDatabase.get(payload.monsterpediaId);
        menu.append();
        menu.setMonsterInOverworld(this.addMonsterToLevel(monster));
    }

    addMonsterToLevel (monster) {
        const { x, y } = this.scene.$playerController.getPosition();
        const monsterCharacter = Character.addToLevel({
            name: `wildmon_${Date.now()}`,
            position: {
                x,
                y: y - 1,
                facing: DIRECTIONS_HASH.DOWN
            },
            sprite: monster.name,
            type: CHAR_TYPES.WILD
        });
        this.lookAtMonster();
        //this.scene.children.bringToTop(this.scene.$playerController.getPlayerGameObject());
        return monsterCharacter;
    }

    lookAtMonster () {
        this.scene.$playerController.lookAt(DIRECTIONS_HASH.UP);
    }

};

export default Wild;