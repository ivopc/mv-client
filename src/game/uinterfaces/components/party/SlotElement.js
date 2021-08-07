import DragglableGridElement from "../generics/DragglableGridElement";

import { PARTY_INTERFACE_TYPES } from "@/game/constants/Party";

import { addGenericUIComponent } from "@/game/utils";

class SlotElement extends DragglableGridElement {
    constructor (scene, gridListData, gridElementIndex, layout) {
        super(scene, gridListData, gridElementIndex);
        this.layout = layout;
        this.monsterData;
        this.type;
        // components
        this.iconBackground;
        this.nameBackground;
        this.level;
        this.healthBar;
        this.healthText;
        this.gender;
        this.statusProblem;
        scene.add.existing(this);
    }

    append () {
        const { scene } = this;
        /*if (this.type === PARTY_INTERFACE_TYPES.COMMON)
            this.setDragListeners();*/
        this.iconBackground = addGenericUIComponent(this.layout.slotMonIcon, scene);
        this.nameBackground = addGenericUIComponent(this.layout.slotMonName, scene);
        this.add(this.iconBackground);
        this.add(this.nameBackground);
    }

    updateMonster (monsterData) {}

};

export default SlotElement;