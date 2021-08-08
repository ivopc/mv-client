import Phaser from "phaser";
//import Text from "@/game/managers/Text";
// {placeholder}
const Text = {
    ref: {
        lang: "br"
    }
};

import { timedEvent } from "@/game/utils/scene.promisify";
import { animationTimerDelay, interactionLockDelay } from "@/game/constants/Dialog";

class AnimatedDialogText extends Phaser.GameObjects.Text {
    constructor (scene, style) {
        super(scene, style.x, style.y, "", style);
        this.textContainer = text;
        this.textListIndex = 0;
        this.specificTextPhraseIndex = 0;
        this.phraseLetterIndex = 0;
        this.animationTimer;
        this.animationInProgress = false;
        this.isInteractionLocked = false;
        this.onEndCallback;
        this.onEndCallbackList = [];
    }

    setAnimationTimer (delay = animationTimerDelay) {
        this.animationInProgress = true;
        this.animationTimer = this.scene.time.addEvent({
            delay, 
            callback: this.animate, 
            callbackScope: this,
            loop: true
        });
    }

    async unlockInteraction () {
        await timedEvent(interactionLockDelay, this.scene);
        this.isInteractionLocked = false;
    }

    next () {
        if (this.isInteractionLocked)
            return;
        this.isInteractionLocked = true;
        // check if is in the last dialog and if the animation is not in progress
        if (this.specificTextPhraseIndex >= this.textContainer[this.textListIndex][Text.ref.lang].length && !this.animationInProgress) {
            console.log("último dialogo");
            this.onEnd();
            this.destroy();
            return;
        };
        // if dialog is in progress skip animation and set to the last letter directly
        if (this.animationInProgress) {
            this.animationTimer.destroy();
            this.setText(this.textContainer[this.textListIndex][Text.ref.lang][this.specificTextPhraseIndex]);
            this.specificTextPhraseIndex ++;
            this.phraseLetterIndex = 0;
            this.animationInProgress = false;
        // if not in progress throw to the next dialog
        } else {
            this.setText("");
            this.setAnimationTimer();
            this.animationInProgress = true;
        };
        this.unlockInteraction();
    }

    animate () {
        if (this.text[this.textListIndex][Text.ref.lang][this.specificTextPhraseIndex].length === this.phraseLetterIndex) {
            this.animationTimer.destroy();
            this.animationInProgress = false;
            this.specificTextPhraseIndex ++;
            this.phraseLetterIndex = 0;
            return;
        };
        this.setText(
            this.text + 
            this.text[this.textListIndex][Text.ref.lang][this.specificTextPhraseIndex][this.phraseLetterIndex++]
        );
    }

    setOnEnd (callback) {
        this.onEndCallback = callback;
    }

    addOnEndEvent (callback) {
        this.onEndCallbackList.push(callback);
    }

    onEnd () {
        if (typeof this.onEndCallback === "function")
            this.onEndCallback();
        this.onEndCallbackList.forEach(callback => callback());
    }

    waitForEnd () {
        return new Promise(resolve => this.setOnEnd(resolve));
    }

    destroy () {
        super.destroy();
        this.animationTimer.destroy();
    }
};

/*;(async () => {
    const dialog = new AnimatedDialogText(this, [
        {
            br: [
                "UMA COISA DIFERENTE UMA COISA DIFERENTE",
                "CERTAMENTE ACONTECE CERTAMENTE ACONTECE",
                "É SEQUENCIA DO GRAVE, É SEQUENCIA DO GRAVE",
                "QUANDO EU CANTO O BAILE ESTREMECE",
                "UMA COISA DIFERENTE UMA COISA DIFERENTE2",
                "CERTAMENTE ACONTECE CERTAMENTE ACONTECE2",
                "É SEQUENCIA DO GRAVE, É SEQUENCIA DO GRAVE2",
                "QUANDO EU CANTO O BAILE ESTREMECE2"
            ]
        }
    ]);
    window.dialog = dialog;
    dialog.createText({
        x: 0,
        y: 0
    }, {
        fontFamily: "Century Gothic", 
        fontSize: 50, 
        color: "#fff" 
    });
    dialog.textComponent.setScrollFactor(0);
    dialog.setAnimationTimer();
    await dialog.waitForEnd();
    console.log("DIALOGO ACABOU CRL! POHA! FIM!");
})();*/

/*
{
    fontFamily: "Century Gothic", 
    fontSize: 14, 
    color: "#fff",
    wordWrap: {
        width: this.sys.game.canvas.width - 10,
        useAdvancedWrap: true
    }
}

*/

export default AnimatedDialogText;