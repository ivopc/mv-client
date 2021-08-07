import RuntimeUI from "./RuntimeUI";
import { fadeoutDestroy, scaleDownDestroy } from "@/game/utils/scene.promisify";

import { UI_EVENTS } from "@/game/constants/UI";

import { setEnabledButtonsList } from "@/game/utils";

class MonsterStatus extends RuntimeUI {
    constructor (scene) {
        super(scene, "monsterStatus");
        /**
         * added by `ui-behavior.runtime`
         */
        this.tabsHitbox = [];
        this.addEvents();
    }

    addEvents () {
        this.addListener(UI_EVENTS.SWITCH_TAB({ container: "monsterInfos", tab: "status" }), this.onTabStatus, this);
        this.addListener(UI_EVENTS.SWITCH_TAB({ container: "monsterInfos", tab: "stats" }), this.onTabStats, this);
        this.addListener(UI_EVENTS.SWITCH_TAB({ container: "monsterInfos", tab: "moves" }), this.onTabMoves, this);
    }

    onTabStatus () {
        console.log("Está no status");
    }

    onTabStats () {
        console.log("Está no stats");
    }

    onTabMoves () {
        console.log("Está no moves");
    }

    behaviors = {}
};

export default MonsterStatus;