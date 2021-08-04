import RuntimeUI from "./RuntimeUI";
import { fadeoutDestroy, scaleDownDestroy } from "@/game/utils/scene.promisify";

import { setEnabledButtonsList } from "@/game/utils";

class InitialMonster extends RuntimeUI {
    constructor (scene) {
        super(scene, "initial");
        this.currentChoice;
    }

    append () {
        super.append();
        this.handleMonstersOptions();
    }

    handleMonstersOptions () {
        [ ... Array(3)].forEach((el, index) => 
            this.getByName("monSelection" + index).on.click = () => this.onClickMonster(index)
        );
    }

    onClickMonster (index) {
        this.currentChoice = index;
        this.manager.renderizeWindow("ACCEPT_REJECT_MONSTER");
        const enabled = false;
        setEnabledButtonsList(this.list, enabled);
    }

    behaviors = {
        acceptReject0: async function () {
            await scaleDownDestroy(this.getByName("ACCEPT_REJECT_MONSTER"), 300);
            const enabled = true;
            setEnabledButtonsList(this.list, enabled);
        },
        acceptReject1: function () {
            console.log("Recusou");
        }
    }
};

export default InitialMonster;