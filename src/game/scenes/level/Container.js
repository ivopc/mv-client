class Container {
    constructor (scene) {
        this.scene = scene;
    }

    create () {
        this.map = this.scene.add.container();
        this.test = this.scene.add.container();
        this.main = this.scene.add.container();
        this.preOverlay = this.scene.add.container();
        this.overlay = this.scene.add.container();
        [this.map, this.overlay].forEach(layer => layer.visible = false); // {placeholder}
    }

    forEach (fn) {
        [this.map, this.main, this.preOverlay, this.overlay].forEach(fn);
    }

    characterDepthSort () {}

    reorganize () {
        this.forEach(layer => this.scene.bringToTop(layer));
    }
};
export default Container;