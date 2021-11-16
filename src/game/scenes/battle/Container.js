class Container {
    constructor (scene) {
        this.scene = scene;//$containers
        this.main;
        this.field;
    }

    create () {
        this.main = this.scene.add.container();
        //this.main.setSize(1280, 720);
    }
};

export default Container;

