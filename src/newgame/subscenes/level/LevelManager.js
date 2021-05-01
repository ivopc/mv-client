import Database from "@/newgame/managers/Database";

class LevelManager {
    constructor (scene) {
        this.scene = scene;
    }

    async changeLevel (warpData) {
        const { scene } = this;
        scene.$tilemap.clear();
        const levelData = Database.ref.level[warpData.mid];
        scene.$tilemap.setLevelData(levelData);
        await scene.$loader.changeLevel(levelData);
        scene.$tilemap.create();
        scene.$playerController.rawSetPosition(warpData);
        scene.$cameraController.setBounds();
    }
};

export default LevelManager;