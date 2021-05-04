//import Text from "@/newgame/managers/Text";

import { timedEvent } from "@/newgame/utils/scene.promisify";
import { animationTimerDelay, interactionLockDelay } from "@/newgame/constants/Dialog";

// placeholder
const Text = {
    ref: {
        lang: "br"
    }
};

class AnimatedDialogText {
    constructor (scene, text) {
        this.scene = scene;
        this.text = text;
        this.textListIndex = 0;
        this.specificTextPhraseIndex = 0;
        this.phraseLetterIndex = 0;
        this.textComponent;
        this.animationTimer;
        this.animationInProgress = false;
        this.isInteractionLocked = false;
        this.onEndCallback;
        this.onEndCallbackList = [];
    }

    createText (textPosition, textStyle) {
        this.textComponent = this.scene.add.text(
            textPosition.x, 
            textPosition.y, 
            "", 
            textStyle
        );
        return this.textComponent;
    }

    setAnimationTimer (delay) {
        this.animationInProgress = true;
        this.animationTimer = this.scene.time.addEvent({
            delay: delay || animationTimerDelay, 
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
        if (this.specificTextPhraseIndex >= this.text[this.textListIndex][Text.ref.lang].length && !this.animationInProgress) {
            console.log("último dialogo");
            this.remove();
            this.onEnd();
            return;
        };
        // if dialog is in progress skip animation and set to the last letter directly
        if (this.animationInProgress) {
            this.animationTimer.destroy();
            this.textComponent.setText(this.text[this.textListIndex][Text.ref.lang][this.specificTextPhraseIndex]);
            this.specificTextPhraseIndex ++;
            this.phraseLetterIndex = 0;
            this.animationInProgress = false;
        // if not in progress throw to the next dialog
        } else {
            this.textComponent.setText("");
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
        this.textComponent.setText(
            this.textComponent.text + 
            this.text[this.textListIndex][Text.ref.lang][this.specificTextPhraseIndex][this.phraseLetterIndex++]
        );
    }

    remove () {
        this.textComponent.destroy();
        this.animationTimer.destroy();
    }

    setOnEnd (callback) {
        this.onEndCallback = callback;
    }

    addEndEvent (callback) {
        this.onEndCallbackList.push(callback);
    }

    onEnd () {
        if (typeof this.onEndCallback == "function")
            this.onEndCallback();
        this.onEndCallbackList.forEach(callback => callback());
    }

    waitForEnd () {
        return new Promise(resolve => this.setOnEnd(resolve));
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