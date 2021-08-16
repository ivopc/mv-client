class Container {
    constructor (scene) {
        this.scene = scene;
    }

    create () {
        this.main = this.scene.add.container();
    }
};

export default Container;

