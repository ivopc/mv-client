import LevelData from "@/newgame/managers/LevelData";

import behaviors from "./runtime.scripts";

import { promisesWaterfall } from "@/newgame/utils";

class RuntimeScripting {

    behaviors = behaviors;

    constructor (scene) {
        this.scene = scene;
        this.levelScript = LevelData.ref.script;
    }

    parse (actions) {
        actions = [
            ["walk", "left"],
            ["walk", "down"],
            ["walk", "up"]
        ];
        return actions.map(action => {
            const param = {};
            const fnName = action[0];
            switch(fnName) {
                case "walk": {
                    param.direction = action[1];
                    break;
                };
            };
            return async () => await this.behaviors[fnName].bind(this)(param);
        });
    }

    async run (asyncRuntimeScript) {
        await promisesWaterfall(asyncRuntimeScript);
    }
};

export default RuntimeScripting;