import Phaser from "phaser";

import Slot from "./components/party/Slot";
import SlotElement from "./components/party/SlotElement";

import Layout from "@/newgame/managers/Layout";
import PlayerData from "@/newgame/managers/PlayerData";

import { TYPES } from "@/newgame/constants/Party";

class Party extends Phaser.GameObjects.Container {
    constructor (scene, params = {}) {
        super(scene);
        this.type = params.type;
        this.slots = [];
        this.slotElements = [];
        this.tooltip;
    }

    append () {
        this.background = this.scene.add.sprite(
            Layout.ref.party.background.x, 
            Layout.ref.party.background.y, 
            Layout.ref.party.background.texture
        )
            .setOrigin(0, 0)
            .setInteractive()
            .on("pointerdown", () => this.clearTooltip());
        this.add(this.background);
        this.appendSlots();
    }

    appendSlots () {
        this.slots = Layout.ref.party.slots.positions
            .map(({ x, y }) => new Slot(this.scene, { x, y } ))
            .forEach(slot => this.add(slot));
    }

    appendSlotElements () {
        this.slots.forEach((slot, index) => {
            this.slotElements[index] = new SlotElement(this.scene);
            slot.setCurrentElement(this.slotElements[index]);
            const monster = PlayerData.ref.partyMonsters[index];
            if (monster) {
                this.slotElements[index].updateMonsterData(monster);
            };
            this.add(this.slotElements[index]);
        });
    }

    clear () {}
};

export default Party;