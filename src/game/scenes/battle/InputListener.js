class InputListener {
    constructor (scene) {
        this.scene = scene;//$inputListener
        this.actionKey;
    }

    addListener () {
        this.actionKey = this.scene.input.keyboard.addKey("Z");
        this.actionKey.on("down", () => this.scene.$inputController.triggerAction());
    }
};

export default InputListener;