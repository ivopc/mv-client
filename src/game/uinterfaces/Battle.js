import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";

import { getResolution, addGenericUIComponent } from "@/game/utils";

import HUD from "./components/battle/HUD";

import UInterfaceContainer from "./components/generics/UInterfaceContainer";

class Battle extends UInterfaceContainer {
    constructor (scene) {
        super(scene, LayoutStaticDatabase.get("battle"));
        scene.add.existing(this);
        this.baseMenu;
        this.hudLeft;
        this.hudRight;
    }

    append () {
        this.actionMenu = addGenericUIComponent(this.layout.actionMenu.base, this.scene);
        this.hudLeft = new HUD(this.scene, "player").append();
    }
};

export default Battle;