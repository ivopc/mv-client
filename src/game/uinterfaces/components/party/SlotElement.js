import DragglableGridElement from "../DragglableGridElement";

import { TYPES } from "@/game/constants/Party";

class SlotElement extends DragglableGridElement {
    constructor (scene, gridListData, gridElementIndex) {
        super(scene, gridListData, gridElementIndex);
        this.monsterData;
        this.type;
        // components
        this.icon;
        this.name;
        this.level;
        this.healthBar;
        this.healthText;
        this.gender;
        this.statusProblem;
        scene.add.existing(this);
    }

    append () {
        if (this.type === TYPES.PARTY)
            this.setDragListeners();
    }

    updateMonsterData (monsterData) {}

};

export default SlotElement;