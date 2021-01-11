class Container {
    constructor (scene) {
        this.scene = scene;
    }

    create () {
        this.map = this.scene.add.container();
        this.preOverlay = this.scene.add.container();
        this.overlay = this.scene.add.container();
    }
};
export default Container;