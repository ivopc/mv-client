import DragglableGridElement from "../generics/DragglableGridElement";

import PointsBar from "../generics/PointsBar";

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
        const { 
            slotMonIcon, 
            slotMonName, 
            slotMonGender, 
            slotHpBar, 
            slotHpBarIcon,
            slotHpBarFrame, 
            slotMpBar,
            slotMpBarIcon,
            slotMpBarFrame 
        } = this.layout;
        this.iconBackground = addGenericUIComponent(slotMonIcon, scene);
        this.nameBackground = addGenericUIComponent(slotMonName, scene);
        this.gender = addGenericUIComponent(slotMonGender, scene);
        this.gender.setFrame(Math.random() > .5 ? 0 : 1); // {placeholder}
        this.healthBar = new PointsBar(this.scene, {
            x: slotHpBar.position.x,
            y: slotHpBar.position.y,
            width: slotHpBar.width,
            height: slotHpBar.height,
            barColor: slotHpBar.color.bar,
            bgColor: slotHpBar.color.bg
        });
        this.healthBar.addFrame(slotHpBarFrame.texture);
        this.healthBar.addIcon(slotHpBarIcon);
        this.manaBar = new PointsBar(this.scene, {
            x: slotMpBar.position.x,
            y: slotMpBar.position.y,
            width: slotMpBar.width,
            height: slotMpBar.height,
            barColor: slotMpBar.color.bar,
            bgColor: slotMpBar.color.bg
        });
        this.manaBar.addFrame(slotMpBarFrame.texture);
        this.manaBar.addIcon(slotMpBarIcon);
        this.add([
            this.iconBackground, 
            this.nameBackground, 
            this.gender, 
            this.healthBar, 
            this.manaBar
        ]);
    }

    updateMonster (monsterData) {}

};

export default SlotElement;