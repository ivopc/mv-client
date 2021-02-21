class Party extends Phaser.GameObjects.Container {
    constructor (scene, params = {}) {
        super(scene);
        this.type = params.type;
    }

    append () {}

    clear () {}

    appendSlots () {}
    
};

export default Party;