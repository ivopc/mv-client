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

    setBounds () {
        const { scene } = this;
        scene.cameras.main.setBounds(0, 0, scene.$tilemap.tilemap.widthInPixels, scene.$tilemap.tilemap.heightInPixels);
    }

    followGameObject (gameObject) {
        this.scene.cameras.main.startFollow(gameObject, true, 1, 1);
    }
};

export default CameraController;