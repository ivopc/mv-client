import Phaser from "phaser";

import Slot from "./components/party/Slot";
import SlotElement from "./components/party/SlotElement";

import Layout from "@/newgame/managers/Layout";
import PlayerData from "@/newgame/managers/PlayerData";

import { PARTY_INTERFACE_TYPES } from "@/newgame/constants/Party";

class Party extends Phaser.GameObjects.Container {
    constructor (scene, params = {}) {
        super(scene);
        this.layout = Layout.ref.data.party;
        this.type = params.type || PARTY_INTERFACE_TYPES.COMMON;
        this.slots = new Array(6);
        this.tooltip;
    }

    append () {
        this.background = this.scene.add.sprite(
            this.layout.background.x, 
            this.layout.background.y, 
            this.layout.background.texture
        )
            .setOrigin(0, 0)
            .setInteractive()
            .on("pointerdown", () => this.clearTooltip());
        this.add(this.background);
        this.appendSlots();
        this.appendSlotElements();
    }

    appendSlots () {
        this.slots = this.layout.slots.positions
            .map(position => {
                const slot = new Slot(this.scene, position);
                this.add(slot);
                return slot;
            });
    }

    appendSlotElements () {
        this.slots.forEach((slot, index) => {
            const slotElements = new SlotElement(this.scene);
            slot.add(slotElements);
            slotElements.setParentBasePosition(slot.x, slot.y);
            const monster = PlayerData.ref.partyMonsters[index];
            if (monster) {
                slot.elements.updateMonsterData(monster);
            };
        });
    }
};

export default Party;