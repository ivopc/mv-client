import InterfaceContainer from "./components/InterfaceContainer";
import Slot from "./components/party/Slot";
import SlotElement from "./components/party/SlotElement";

import Layout from "@/game/managers/Layout";
import PlayerData from "@/game/managers/PlayerData";

import { PARTY_INTERFACE_TYPES } from "@/game/constants/Party";
import { addGenericUIComponent } from "@/game/utils";

class Party extends InterfaceContainer {
    constructor (scene, params = {}) {
        super(scene, Layout.ref.get("party"));
        this.type = params.type || PARTY_INTERFACE_TYPES.COMMON;
        this.slots = new Array(6);
        this.tooltip;
    }

    append () {
        this.background = addGenericUIComponent(this.layout.background, this.scene)
        /*    .setInteractive()
            .on("pointerdown", () => this.clearTooltip());*/
        console.log(this.layout.background);
        this.add(this.background);
        /*this.appendSlots();
        this.appendSlotElements();*/
        this.setOriginalBaseSize(this.background);
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