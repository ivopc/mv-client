import { game } from "@/game";
import LevelData from "@/game/managers/LevelData";

import { DEFAULT_LEVEL_ZOOM } from "@/game/constants/Overworld";

class CameraController {
    constructor (scene) {
        this.scene = scene;//$cameraController
    }

    setup () {
        this.camera.roundPixels = true;
        this.camera.width = game.canvas.width;
        this.camera.height = game.canvas.height;
        this.camera.x = 0;
        this.camera.y = 0;
    }

    setBounds () {
        const { tilemap } = this.scene.$tilemap;
        this.camera.setBounds(0, 0, 800, 512); // {placeholder}
        return;
        this.camera.setBounds(0, 0, tilemap.widthInPixels, tilemap.heightInPixels);
    }

    followGameObject (gameObject) {
        this.camera.startFollow(gameObject, false, 1, 1);
    }

    setDefaultZoom () {
        // the zoom is related to specific level config
        this.camera.setZoom(LevelData.ref.script.map.zoom || DEFAULT_LEVEL_ZOOM);
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