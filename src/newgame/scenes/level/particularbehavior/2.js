import BaseLevelScript from "./BaseLevelScript";

import { timedEvent } from "@/newgame/utils/scene.promisify";

class LevelScript extends BaseLevelScript {
    async test (params) {
        console.log("test callLevelBehavior", params);
        await timedEvent(3000, this.scene);
    }
};

export default LevelScript;