import LevelData from "@/newgame/managers/LevelData";
import Database from "@/newgame/managers/Database";
import Assets from "@/newgame/managers/Assets";

import Character from "@/newgame/prefabs/Character";

import { CHAR_TYPES } from "@/newgame/constants/Character";

class BaseLevelScript {
    constructor (scene) {
        this.scene = scene;
        this.scriptData;
    }

    create () {
        console.log("Particular Behavior Created");
        const scriptData = this.scene.cache.json.get(Assets.ref.getLevelScript(LevelData.ref.id).key);
        this.setScript(scriptData);
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
        characterData.sprite = 2;
        return characterData;
    }

    insertLevelObject (levelObjectData) {
        const { scene } = this;
        const character = new Character(scene, levelObjectData);
        scene.add.existing(character);
        scene.$charactersController.addStaticCharacter(character);
    }

    autoExec () {}

    setScript (data) {
        this.scriptData = data;
    }
};

export default BaseLevelScript;