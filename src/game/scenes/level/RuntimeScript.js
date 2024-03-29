import LevelData from "@/game/managers/LevelData";

import behaviors from "./runtime.scripts";

import { promisesWaterfall } from "@/lib/utils";

class RuntimeScript {

    static behaviors = behaviors;

    constructor (scene) {
        this.scene = scene;
        this.level = {
            script: LevelData.ref.script,
            behavior: scene.$levelBehavior
        };
    }

    parse (actions) {
        actions = [
            ["walk", "left"],
            ["walk", "down"],
            ["walk", "up"],
            ["callLevelBehavior", "test", {noob: 123, teste: "lol"}],
            ["walk", "right"]
        ];
        return actions.map(action => {
            const fnName = action[0];
            const param = {};
            switch(fnName) {
                case "walk": {
                    param.direction = action[1];
                    break;
                };
                case "callLevelBehavior": {
                    param.fn = action[1];
                    param.param = action[2] || {};
                    break;
                };
            };
            return async () => await RuntimeScript.behaviors[fnName].bind(this)(param);
        });
    }

    async run (asyncRuntimeScript) {
        await promisesWaterfall(asyncRuntimeScript);
        console.log("Terminou");
    }

    setLevelScript (data) {
        this.level.script = data;
    }
};

export default RuntimeScript;