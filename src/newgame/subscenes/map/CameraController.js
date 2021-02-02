class CameraController {
    constructor (scene) {
        this.scene = scene;
    }

    setup () {
        const { scene } = this;
        scene.cameras.main.roundPixels = true;
        scene.cameras.main.setZoom(2);
        scene.cameras.main.width = 1280;
        scene.cameras.main.height = 720;
        scene.cameras.main.x = 0;
        scene.cameras.main.y = 0;
    }
};

export default CameraController;