import LevelData from "@/game/managers/LevelData";
import Database from "@/game/managers/Database";
import Assets from "@/game/managers/Assets";

import Character from "@/game/prefabs/Character";

import { CHAR_TYPES } from "@/game/constants/Character";

class BaseLevelScript {
    constructor (scene) {
        this.scene = scene;//$levelBehavior
    }

    create () {
        const scriptData = this.scene.cache.json.get(Assets.ref.getLevelScript(LevelData.ref.id).key);
        LevelData.ref.setScript(scriptData);
        this.insertLevelObjects();
    }

    insertLevelObjects () {
        Object.keys(this.scriptData.elements.config)
            .map(element => this.generateLevelObjectData(this.scriptData.elements.config[element]))
            .forEach(levelObjectData => this.insertLevelObject(levelObjectData));
    }

    generateLevelObjectData (element) {
        const currentFlag = element.default;
        let characterData;
        switch (element.type) {
            case CHAR_TYPES.NPC: {
                characterData = {
                    name: element.name,
                    sprite: currentFlag.sprite || element.default.sprite,
                    position: {
                        x: currentFlag.position.x || element.default.position.x,
                        y: currentFlag.position.y || element.default.position.y,
                        facing: currentFlag.position.facing || element.default.position.facing
                    },
                    type: element.type,
                    visible: "visible" in currentFlag ? currentFlag.visible : true
                };
                break;
            };
            case CHAR_TYPES.TAMER: {
                characterData = {
                    isTamer: true,
                    maxView: element.maxView,
                    name: element.name,
                    sprite: currentFlag.sprite || element.default.sprite,
                    position: {
                        x: currentFlag.position.x || element.default.position.x,
                        y: currentFlag.position.y || element.default.position.y,
                        facing: currentFlag.position.facing || element.default.position.facing
                    },
                    type: element.type,
                    visible: "visible" in currentFlag ? currentFlag.visible : true
                };
                break;
            };
        };
        characterData.sprite = 2; // {placeholder}
        return characterData;
    }

    insertLevelObject (levelObjectData) {
        Character.addtoLevel(levelObjectData);
    }

    get scriptData () {
        return LevelData.ref.script;
    }
};

export default BaseLevelScript;