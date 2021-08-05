import RuntimeUI from "./RuntimeUI";
import { fadeoutDestroy, scaleDownDestroy } from "@/game/utils/scene.promisify";

import { setEnabledButtonsList } from "@/game/utils";

const MONSTER_SELECTION = {
    FOGARA: "monSelection0",
    GRAENN: "monSelection1",
    MARITIN: "monSelection2"
};

const MONSTER_WINDOW_CHOICE = {
    ACCEPT: "acceptReject0",
    REJECT: "acceptReject1"
};

class InitialMonster extends RuntimeUI {
    constructor (scene) {
        super(scene, "initial");
        this.currentChoice;
    }

    onClickMonster (index) {
        this.currentChoice = index;
        this.manager.renderizeWindow("ACCEPT_REJECT_MONSTER");
        const enabled = false;
        setEnabledButtonsList(this.list, enabled);
    }

    behaviors = {
        [MONSTER_SELECTION.FOGARA]: function () {
            this.onClickMonster(0);
        },
        [MONSTER_SELECTION.GRAENN]: function () {
            this.onClickMonster(1);
        },
        [MONSTER_SELECTION.MARITIN]: function () {
            this.onClickMonster(2);
        },
        [MONSTER_WINDOW_CHOICE.ACCEPT]: async function () {
            console.log(this.currentChoice);
            await scaleDownDestroy(this.getByName("ACCEPT_REJECT_MONSTER"), 300);
            const enabled = true;
            setEnabledButtonsList(this.list, enabled);
        },
        [MONSTER_WINDOW_CHOICE.REJECT]: function () {
            console.log("Recusou");
        }
    }
};

export default InitialMonster;