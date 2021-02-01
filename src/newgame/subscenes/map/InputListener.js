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
        this.pressed[event.keyCode] = true;
        this.onPressed(event.keyCode);
    }

    onKeyUp (event) {
        delete this.pressed[event.keyCode];
    }

    onPressed (keyCode) {
        this.scene.$inputController.triggerPressed(keyCode);
    }

    addListener () {
        this.addKeyboardListener();
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

    isKeyDown (keyCode) {
        return this.pressed[keyCode];
    }

    checkKeyboard () {
        if (this.isKeyDown(this.listenerKeys.UP) || this.isKeyDown(this.listenerKeys.W))
            this.scene.$inputController.triggerFromListener(DIRECTIONS.UP);
        else if (this.isKeyDown(this.listenerKeys.DOWN) || this.isKeyDown(this.listenerKeys.S))
            this.scene.$inputController.triggerFromListener(DIRECTIONS.DOWN);

        if (this.isKeyDown(this.listenerKeys.LEFT) || this.isKeyDown(this.listenerKeys.A))
            this.scene.$inputController.triggerFromListener(DIRECTIONS.LEFT);
        else if (this.isKeyDown(this.listenerKeys.RIGHT) || this.isKeyDown(this.listenerKeys.D)) 
            this.scene.$inputController.triggerFromListener(DIRECTIONS.RIGHT);
    }

    checkDPad () {}

    update () {
        if (this.isMobile)
            this.checkDPad();
        else
            this.checkKeyboard();
    }
};

export default InputListener;