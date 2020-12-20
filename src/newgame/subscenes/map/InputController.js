//import { MAP_STATES } from "@/newgame/constants/States";
import { DIRECTIONS } from "@/newgame/constants/Directions";
import { ACTION_KEYS } from "@/newgame/constants/ActionKeys";

class InputController {
    constructor (scene) {
        this.scene = scene;
    }

    triggerFromListener (value) {
        if (value >= DIRECTIONS.UP && value <= DIRECTIONS.LEFT && this.scene.$state == MAP_STATES.IDLE)
            this.movePlayer(value);
    }

    triggerPressed (value) {
        if (value == ACTION_KEYS.INTERACTION)
            this.interaction();
    }

    movePlayer (direction) {
        this.scene.$player.move(direction);
    }

    interaction () {
        const { scene } = this;
        switch (scene.$state) {
            case MAP_STATES.IDLE: {
                scene.$interactionController.interact();
                break;
            };
            case MAP_STATES.DIALOGUING: {
                scene.$dialogController.next();
                break;
            };
        };
    }
};

export default InputController;