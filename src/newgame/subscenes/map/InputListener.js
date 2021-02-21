/*
* InputListener.js
*
* class to create listeners of keyboard and touch d-pad for PC
* and mobile devices and emit events to InputController instance
*
*/

import { DIRECTIONS } from "@/newgame/constants/Directions";

class InputListener {
    constructor (scene) {
        this.scene = scene;
        this.inputPressingTime = 0;
        this.gameTime = 0;
    }

    listenerKeys = {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        W: 87,
        A: 65,
        S: 83,
        D: 68
    }

    pressed = {}

    onKeyDown (event) {
        if (!this.isKeyDown(event.keyCode))
            this.inputPressingTime = this.gameTime;
        this.pressed[event.keyCode] = true;
        this.onPressed(event.keyCode);
    }

    onKeyUp (event) {
        this.inputPressingTime = 0;
        delete this.pressed[event.keyCode];
    }

    onPressed (keyCode) {
        this.scene.$inputController.triggerPressed(keyCode);
    }

    isKeyDown (keyCode) {
        return this.pressed[keyCode];
    }

    addListener () {
        if (this.isMobile)
            this.addDPadListener();
        else
            this.addKeyboardListener();
    }

    removeListener () {
        if (this.isMobile)
            this.removeDPadListener();
        else
            this.removeKeyboardListener();
    }
    
    addKeyboardListener () {
        document.addEventListener("keyup", this.onKeyUp.bind(this), false);
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);
    }

    removeKeyboardListener () {
        document.removeEventListener("keyup", this.onKeyUp.bind(this), false);
        document.removeEventListener("keydown", this.onKeyDown.bind(this), false);
        this.pressed = {};
    }

    addDPadListener () {}

    checkKeyboard () {
        if (this.isKeyDown(this.listenerKeys.UP) || this.isKeyDown(this.listenerKeys.W))
            this.scene.$inputController.triggerFromListener(DIRECTIONS.UP, this.getInputTiming());
        else if (this.isKeyDown(this.listenerKeys.DOWN) || this.isKeyDown(this.listenerKeys.S))
            this.scene.$inputController.triggerFromListener(DIRECTIONS.DOWN, this.getInputTiming());

        if (this.isKeyDown(this.listenerKeys.LEFT) || this.isKeyDown(this.listenerKeys.A))
            this.scene.$inputController.triggerFromListener(DIRECTIONS.LEFT, this.getInputTiming());
        else if (this.isKeyDown(this.listenerKeys.RIGHT) || this.isKeyDown(this.listenerKeys.D)) 
            this.scene.$inputController.triggerFromListener(DIRECTIONS.RIGHT, this.getInputTiming());
    }

    checkDPad () {}

    update (time) {
        this.gameTime = time;
        if (this.isMobile)
            this.checkDPad();
        else
            this.checkKeyboard();
    }

    getInputTiming () {
        return this.gameTime - this.inputPressingTime;
    }
};

export default InputListener;