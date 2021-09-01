import { GameObjects } from "phaser";

import { HUD_TYPES } from "@/game/constants/Battle";

import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";

import UInterfaceContainer from "@/game/uinterfaces/components/generics/UInterfaceContainer";

import { addGenericUIComponent } from "@/game/utils";

class HUD extends GameObjects.Container {
    constructor (scene, type) {
        super(scene);
        this.type = type;
        this.layout = LayoutStaticDatabase.get("battle").monsterHud.x1[type];
        scene.add.existing(this);
    }

    append () {
        this.addBase();
        switch (this.type) {
            case HUD_TYPES.PLAYER: {
                this.addHealthBar();
                this.addManaBar();
                this.addExpBar();
                break;
            };
            case HUD_TYPES.OPPONENT: {
                this.addHealthBar();
                break;
            };
        };
    }

    addBase () {
        this.base = this.scene.add.sprite(
            this.layout.base.position.x,
            this.layout.base.position.y,
            this.layout.base.texture
        ).setOrigin(0);
        this.add(this.base);
    }

    addHealthBar () {}

    addManaBar () {}

    addExpBar () {}
};

export default HUD;