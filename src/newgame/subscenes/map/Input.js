/*
* Input.js
*
* class to control inputs and create listeners for PC and mobile devices
*
*/

import Button from "@/game/interfaces/components/button";

class Input {
    constructor (scene) {
        this.scene = scene;
    }

    key = {
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
    }

    onKeyUp (event) {
        delete this.pressed[event.keyCode];
    }

    addKeyboardListener () {
        document.addEventListener("keyup", this.onKeyUp, false);
        document.addEventListener("keydown", this.onKeyDown, false);
    }

    removeKeyboardListener () {
        document.removeEventListener("keyup", this.onKeyUp, false);
        document.removeEventListener("keydown", this.onKeyDown, false);
    }

    addDPad () {}

    isKeyDown (keyCode) {
        return this.pressed[keyCode];
    }

    checkKeyboard () {
        if (this.isKeyDown(this.key.UP) || this.isKeyDown(this.key.W))
            this.scene.player.walk(0);
        else if (this.isKeyDown(this.key.DOWN) || this.isKeyDown(this.key.S))
            this.scene.player.walk(2);
    }

    checkDPad () {}

    update () {
        if (this.scene.isMobile)
            this.checkDPad();
        else
            this.checkKeyboard();
    }
};

export default Input;