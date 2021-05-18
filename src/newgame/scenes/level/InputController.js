import StateManager from "@/newgame/managers/StateManager";

import { DIRECTIONS_HASH, STEP_TIME } from "@/newgame/constants/Overworld";
import { ACTION_KEYS } from "@/newgame/constants/ActionKeys";
import { LEVEL_STATES } from "@/newgame/constants/States";

class InputController {
    constructor (scene) {
        this.scene = scene;
    }

    triggerFromListener (value, timeStep) {
        if (value >= DIRECTIONS_HASH.UP && value <= DIRECTIONS_HASH.LEFT /*&& this.scene.$state == LEVEL_STATES.IDLE*/)
            this.movePlayer(value, timeStep);
    }

    triggerPressed (value) {
        if (value == ACTION_KEYS.INTERACTION)
            this.interaction();
    }

    triggerScroll (zoom) {
        if (zoom > 0) {
            this.scene.$cameraController.zoomIn();
        } else {
            this.scene.$cameraController.zoomOut();
        };
    }

    movePlayer (direction, timeStep) {
        if (timeStep <= STEP_TIME.INPUT)
            this.scene.$playerController.face(direction);
        else
            this.scene.$playerController.move(direction);
    }

    interaction () {
        const { scene } = this;
        switch (LEVEL_STATES.IDLE/*StateManager.ref.getState()*/) {
            case LEVEL_STATES.IDLE: {
                scene.$playerController.interact();
                break;
            };
            case LEVEL_STATES.DIALOG: {
                scene.$dialogController.next();
                break;
            };
        };
    }
};

export default InputController;