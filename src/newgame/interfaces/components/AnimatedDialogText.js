import { timedEvent } from "@/newgame/utils/scene.promisify";
import { animationTimerDelay, interactionLockDelay } from "@/newgame/contants/Dialog";

class AnimatedDialogText {
    constructor (scene, text) {
        this.scene = scene;
        this.text = text;
        this.textListIndex = 0;
        this.specificTopicIndex = 0;
        this.renderingTextComponent;
        this.animationTimer;
        this.animationInProgress = false;
        this.isInteractionLocked = false;
        this.callback;
        this.callbackList = [];
    }

    createText (textPosition, textStyle) {
        this.renderingTextComponent = this.scene.add.text(
            textPosition.x, 
            textPosition.y, 
            "", 
            textStyle
        );

        return this.renderingTextComponent;
    }

    setAnimationTimer (delay) {
        this.animationTimer = this.scene.time.addEvent({
            delay || animationTimerDelay, 
            callback: this.animateDialog, 
            callbackScope: this,
            loop: true 
        });
    }

    async unlockInteraction () {
        await timedEvent(this.scene, interactionLockDelay);
        this.isInteractionLocked = false;
    }

    next () {
        if (this.isInteractionLocked)
            return;
        this.isInteractionLocked = true;
        // checa se está no último dialogo e se a animação não estiver em progresso
        if (this.specificTopicIndex == this.text.length - 1 && !this.animationInProgress) {
            this.remove();
            this.onEnd();
            return;
        };
        // se dialogo estiver em progresso corta animação e seta pra ultima letra da fala
        if (this.animationInProgress) {
            this.animationTimer.destroy();
            this.renderingTextComponent.setText(this.text[this.specificTopicIndex][Texts.ref.lang]);
            this.animationInProgress = false;
        // se não estiver em progresso joga pro próximo dialog
        } else {
            this.renderingTextComponent.setText("");
            this.textListIndex ++;
            this.specificTopicIndex = 0;
            this.setAnimationTimer();
            this.animationInProgress = true;
        };
        this.unlockInteraction();
    }

    animate () {
        if (this.text[this.textListIndex][Texts.ref.lang].length === this.textListIndex) {
            this.animationTimer.destroy();
            this.animationInProgress = false;
            return;
        };
        this.renderingTextComponent.setText(
            this.renderingTextComponent.text + 
            this.text[this.textListIndex][Texts.ref.lang][this.specificTopicIndex++]
        );
    }

    remove () {
        this.renderingTextComponent.destroy();
        this.animationTimer.destroy();
    }

    setOnEnd (callback) {
        this.callback = callback;
    }

    addEndEvent (callback) {
        this.callbackList.push(callback);
    }

    onEnd () {
        if (typeof this.callback == "function")
            this.callback();
        this.callbackList.forEach(callback => callback());
    }

    async waitForEnd () {
        return new Promise(resolve => this.setOnEnd(resolve));
    }
};


;(async () => {
    const dialog = new AnimatedDialogText(this, [
        "TROLLOLOLOLOLOLO1",
        "TROLLOLOLOLOLOLO2",
        "TROLLOLOLOLOLOLO3",
        "TROLLOLOLOLOLOLO4",
        "TROLLOLOLOLOLOLO5",
        "TROLLOLOLOLOLOLO6",
        "TROLLOLOLOLOLOLO7",
        "TROLLOLOLOLOLOLO8",
        "TROLLOLOLOLOLOLO9",
        "TROLLOLOLOLOLOLO0"
    ]);
    await dialog.waitForEnd();
})();


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