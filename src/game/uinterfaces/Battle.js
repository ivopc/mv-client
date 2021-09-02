import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";

import { getResolution, addGenericUIComponent } from "@/game/utils";
import { HUD_TYPES } from "@/game/constants/Battle";

import HUD from "./components/battle/HUD";

import UInterfaceContainer from "./components/generics/UInterfaceContainer";
import ActionMenu from "./components/battle/ActionMenu";

class Battle extends UInterfaceContainer {
    constructor (scene) {
        super(scene, LayoutStaticDatabase.get("battle"));
        this.baseMenu;
        this.hudLeft;
        this.hudRight;
        scene.add.existing(this);
    }

    append () {
        this.actionMenu = new ActionMenu(this.scene, this.layout);
        this.actionMenu.addBase();
        this.actionMenu.addChoiceMenu();
        this.hudLeft = new HUD(this.scene, HUD_TYPES.PLAYER);
        this.hudLeft.append();
        this.hudRight = new HUD(this.scene, HUD_TYPES.OPPONENT);
        this.hudRight.append();
    }

    addToMainContainer () {
        this.scene.$containers.main.add(this);
    }
};

export default Battle;