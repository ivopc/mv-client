class CameraController {
    constructor (scene) {
        this.scene = scene;//$cameraController
    }

    setup () {
        this.camera.roundPixels = true;
        this.camera.setZoom(2);
        this.camera.width = 1280;
        this.camera.height = 720;
        this.camera.x = 0;
        this.camera.y = 0;
    }

    setBounds () {
        const { tilemap } = this.scene.$tilemap;
        this.camera.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);
    }

    followGameObject (gameObject) {
        this.camera.startFollow(gameObject, false, 1, 1);
    }

    zoomIn (val = 0.05) {
        this.camera.zoom += val;
    }

    zoomOut (val = 0.05) {
        // just checking if is in out of camera range
        if (
            (this.camera.zoom - val) * this.scene.$tilemap.tilemap.widthInPixels < this.camera.width ||
            (this.camera.zoom - val) * this.scene.$tilemap.tilemap.heightInPixels < this.camera.height
        )
            return;
        this.camera.zoom -= val;
    }

    get camera () {
        return this.scene.cameras.main;
    }
};

export default CameraController;