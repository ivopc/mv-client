class Container {
    constructor (scene) {
        this.scene = scene;//$containers
        this.main;
        this.field;
    }

    create () {
        this.main = this.scene.add.container();
    }
};

export default Container;

