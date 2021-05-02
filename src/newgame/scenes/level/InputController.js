import StateManager from "@/newgame/managers/StateManager";

import { DIRECTIONS_HASH, STEP_TIME } from "@/newgame/constants/Overworld";
import { ACTION_KEYS } from "@/newgame/constants/ActionKeys";
import { MAP_STATES } from "@/newgame/constants/States";

class InputController {
    constructor (scene) {
        this.scene = scene;
    }

    triggerFromListener (value, timeStep) {
        if (value >= DIRECTIONS_HASH.UP && value <= DIRECTIONS_HASH.LEFT /*&& this.scene.$state == MAP_STATES.IDLE*/)
            this.movePlayer(value, timeStep);
    }

    triggerPressed (value) {
        if (value == ACTION_KEYS.INTERACTION)
            this.interaction();
    }

    movePlayer (direction, timeStep) {
        if (timeStep <= STEP_TIME.INPUT)
            this.scene.$playerController.face(direction);
        else
            this.scene.$playerController.move(direction);
    }

    interaction () {
        const { scene } = this;
        switch (StateManager.ref.getState()) {
            case MAP_STATES.IDLE: {
                scene.$playerController.interact();
                break;
            };
            case MAP_STATES.DIALOG: {
                scene.$dialogController.next();
                break;
            };
        };
    }
};

export default InputController;