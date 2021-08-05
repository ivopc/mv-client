import RuntimeUI from "./RuntimeUI";
import { fadeoutDestroy, scaleDownDestroy } from "@/game/utils/scene.promisify";

import { setEnabledButtonsList } from "@/game/utils";

class MonsterStatus extends RuntimeUI {
    constructor (scene) {
        super(scene, "monsterStatus");
    }

    behaviors = {}
};

export default MonsterStatus;