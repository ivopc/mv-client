import UInterfaceContainer from "./components/generics/UInterfaceContainer";
import Slot from "./components/party/Slot";
import SlotElement from "./components/party/SlotElement";

import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";

import PlayerModel from "@/game/models/PlayerModel";

import { PARTY_INTERFACE_TYPES, MAX_MONSTERS_IN_PARTY } from "@/game/constants/Party";
import { addGenericUIComponent } from "@/game/utils";

class Party extends UInterfaceContainer {
    constructor (scene, params = {}) {
        super(scene, LayoutStaticDatabase.get("party"));
        this.type = params.type || PARTY_INTERFACE_TYPES.COMMON;
        /**
         * @type {Array<Slot>}
         */
        this.slots = [ ... Array(MAX_MONSTERS_IN_PARTY)];
        this.tooltip;
        scene.add.existing(this);
    }

    append () {
        this.background = addGenericUIComponent(this.layout.background, this.scene)
            .setInteractive()
            .on("pointerdown", () => this.clearTooltip());
        this.add(this.background);
        this.setOriginalBaseSize(this.background);
        this.appendSlots();
        this.appendSlotElements();
    }

    appendSlots () {
        this.slots = this.layout.slot.list
            .map((position, index) => {
                const slot = new Slot(this.scene, [], index);
                slot.appendBase(this.layout.slot);
                slot.setupBaseSprite(position)
                slot.setDragListeners();
                this.add(slot);
                return slot;
            });
    }

    appendSlotElements () {
        this.slots.forEach((slot, index) => {
            const slotElements = new SlotElement(this.scene, null, null, this.layout);
            slotElements.setSize(slot.displayWidth, slot.displayHeight);
            slotElements.append();
            const monster = this.playerMonstersData[index];
            if (monster) {
                slotElements.updateMonster(monster);
            };
            slot.add(slotElements);
        });
    }

    get playerMonstersData () {
        return PlayerModel.partyMonsters.list;
    }

    clearTooltip () {}
};

export default Party;