/*
* InputListener.js
*
* class to create listeners of keyboard and touch d-pad for PC
* and mobile devices and emit events to InputController instance
*
*/

import { DIRECTIONS } from "@/newgame/constants/Directions";

class InputListener {
    constructor ({ $inputController, $system }) {
        this.controller = $inputController;
        this.system = $system;
    }

    listenerKeys = {
        LEFT: 37,
        UP: 3,
        RIGHT: 39,
        DOWN: 40,
        W: 87,
        A: 65,
        S: 83,
        D: 68
    }

    pressed = {}

    onKeyDown (event) {
        this.pressed[event.keyCode] = true;
        this.onPressed(event.keyCode);
    }

    onKeyUp (event) {
        delete this.pressed[event.keyCode];
    }

    onPressed (keyCode) {
        this.controller.triggerPressed(keyCode);
    }
    addKeyboardListener () {
        document.addEventListener("keyup", this.onKeyUp, false);
        document.addEventListener("keydown", this.onKeyDown, false);
    }

    removeKeyboardListener () {
        document.removeEventListener("keyup", this.onKeyUp, false);
        document.removeEventListener("keydown", this.onKeyDown, false);
        this.pressed = {};
    }

    isKeyDown (keyCode) {
        return this.pressed[keyCode];
    }

    checkKeyboard () {
        if (this.isKeyDown(this.listenerKeys.UP) || this.isKeyDown(this.listenerKeys.W))
            this.controller.triggerFromListener(DIRECTIONS.UP);
        else if (this.isKeyDown(this.listenerKeys.DOWN) || this.isKeyDown(this.listenerKeys.S))
            this.controller.triggerFromListener(DIRECTIONS.DOWN);

        if (this.isKeyDown(this.listenerKeys.LEFT) || this.isKeyDown(this.listenerKeys.A))
            this.controller.triggerFromListener(DIRECTIONS.LEFT);
        else if (this.isKeyDown(this.listenerKeys.RIGHT) || this.isKeyDown(this.listenerKeys.D)) 
            this.controller.triggerFromListener(DIRECTIONS.RIGHT);
    }

    checkDPad () {}

    update () {
        if (this.system.isMobile)
            this.checkDPad();
        else
            this.checkKeyboard();
    }
};

export default InputListener;