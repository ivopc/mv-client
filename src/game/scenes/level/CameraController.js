import { game } from "@/game";
import LevelData from "@/game/managers/LevelData"; // {legacy}

import { outOfCameraZoomRange } from "@/game/utils";
import { timedEvent } from "@/game/utils/scene.promisify";

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
        this.camera.setBounds(0, 0, 960, 640); // {placeholder}
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
        const { widthInPixels,  heightInPixels } = this.scene.$tilemap.tilemap;
        if (outOfCameraZoomRange(val, this.camera, { width: widthInPixels, height: heightInPixels }))
            return;
        this.camera.zoom -= val;
    }

    get camera () {
        return this.scene.cameras.main;
    }

    async powerZoom (gameObject) {
        const { x, y } = gameObject.getCenter();
        const delay = 900; // {placeholder}
        this.camera.stopFollow();
        this.camera.pan(x, y, delay, "Power2");
        this.camera.zoomTo(5, delay, "Power2", true);
        await timedEvent(delay, this.scene);
    }
};

export default CameraController;