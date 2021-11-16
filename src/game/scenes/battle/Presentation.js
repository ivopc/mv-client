import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";

import {
    WILD_PRESENTATION_INIT_DELAY, 
    WILD_PRESENTATION_HUD_DISPLAY_DELAY 
} from "@/game/constants/Battle";

import { tween } from "@/game/utils/scene.promisify";

class Presentation {
    constructor (scene) {
        this.scene = scene;//$presentation
        this.layout = LayoutStaticDatabase.get("battle");
    }

    field () {}

    playerCharacter () {}

    playerMonster () {}

    async wild () {
        const { right } = this.scene.$field;
        const { hudRight } = this.scene.$ui;
        hudRight.alpha = 0;
        right.x = this.layout.presentation.wild.x;
        await this.scene.$ui.actionMenu.addText();
        await tween({
            targets: right,
            x: 0,
            duration: WILD_PRESENTATION_INIT_DELAY
        }, this.scene);
        await tween({
            targets: hudRight,
            ease: "Linear",
            duration: WILD_PRESENTATION_HUD_DISPLAY_DELAY,
            alpha: 1,
        }, this.scene);
        console.log("VAI TOMA NO CU!");
    }

    tamer () {}

    pvp () {}
};

export default Presentation;