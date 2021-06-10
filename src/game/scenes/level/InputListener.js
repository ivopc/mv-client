/*
* InputListener.js
*
* class to create listeners of keyboard and touch d-pad for PC
* and mobile devices and emit events to InputController instance
*
*/

import { DIRECTIONS } from "@/game/constants/Directions";
import { KEYS_LISTENER } from "@/game/constants/KeyListener";

import { isMobile } from "@/lib/utils";

class InputListener {
    constructor (scene) {
        this.scene = scene;
        this.inputPressingTime = 0;
        this.gameTime = 0;
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

    onScroll (pointer, gameObjects, deltaX, deltaY) {
        this.scene.$inputController.triggerScroll(deltaY <= 0 ? 1 : -1);
    }

    isKeyDown (keyCode) {
        return this.pressed[keyCode];
    }

    addListener () {
        if (isMobile)
            this.addDPadListener();
        else {
            this.addKeyboardListener();
            this.addMouseWheelListener();
        };
    }

    removeListener () {
        if (isMobile)
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

    addMouseWheelListener () {
        this.scene.input.on("wheel", this.onScroll);
    }

    addDPadListener () {}

    checkKeyboard () {
        if (this.isKeyDown(KEYS_LISTENER.UP) || this.isKeyDown(KEYS_LISTENER.W))
            this.scene.$inputController.triggerFromListener(DIRECTIONS.UP, this.getInputTiming());
        else if (this.isKeyDown(KEYS_LISTENER.DOWN) || this.isKeyDown(KEYS_LISTENER.S))
            this.scene.$inputController.triggerFromListener(DIRECTIONS.DOWN, this.getInputTiming());

        if (this.isKeyDown(KEYS_LISTENER.LEFT) || this.isKeyDown(KEYS_LISTENER.A))
            this.scene.$inputController.triggerFromListener(DIRECTIONS.LEFT, this.getInputTiming());
        else if (this.isKeyDown(KEYS_LISTENER.RIGHT) || this.isKeyDown(KEYS_LISTENER.D)) 
            this.scene.$inputController.triggerFromListener(DIRECTIONS.RIGHT, this.getInputTiming());
    }

    checkDPad () {}

    update (time) {
        this.gameTime = time;
        if (isMobile)
            this.checkDPad();
        else
            this.checkKeyboard();
    }

    getInputTiming () {
        return this.gameTime - this.inputPressingTime;
    }
};

export default InputListener;