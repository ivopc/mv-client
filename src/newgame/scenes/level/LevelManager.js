import Database from "@/newgame/managers/Database";

class LevelManager {
    constructor (scene) {
        this.scene = scene;
    }

    async changeLevel (warpData) {
        const { scene } = this;
        const levelData = Database.ref.level[warpData.mid];
        scene.$charactersController.clear();
        scene.$tilemap.clear();
        scene.$tilemap.setLevelData(levelData);
        await scene.$loader.changeLevel(levelData);
        scene.$tilemap.create();
        scene.$playerController.rawSetPosition(warpData);
        scene.$cameraController.setBounds();
        scene.$network.subscribeLevel(warpData.mid);
    }
};

export default LevelManager;