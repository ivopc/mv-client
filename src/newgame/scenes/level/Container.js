class Container {
    constructor (scene) {
        this.scene = scene;
    }

    create () {
        this.map = this.scene.add.container();
        this.main = this.scene.add.container();
        this.preOverlay = this.scene.add.container();
        this.overlay = this.scene.add.container();
    }

    characterDepthSort () {}

    reorganize () {
        const { scene } = this;
        scene.bringToTop(this.map);
        scene.bringToTop(this.main);
        scene.bringToTop(this.preOverlay);
        scene.bringToTop(this.overlay);
    }
};
export default Container;