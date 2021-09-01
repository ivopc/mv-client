class Container {
    constructor (scene) {
        this.scene = scene;//$containers
        this.main;
        this.field;
    }

    create () {
        this.main = this.scene.add.container();
        console.log("oikkkk", this.main);
    }
};

export default Container;

