import Database from "@/game/managers/Database";
import LevelData from "@/game/managers/LevelData"; // {legacy}

class LevelManager {
    constructor (scene) {
        this.scene = scene;//$manager
    }

    async changeLevel (warpData) {
        const { scene } = this;
        const levelData = Database.ref.level[warpData.levelId];
        LevelData.ref.update({
            id: warpData.levelId
        }); // {legacy}
        //console.log("characters1", scene.$charactersController);
        scene.$charactersController.clear();
        scene.$tilemap.clear();
        await scene.$loader.changeLevel(levelData);
        //console.log("characters2", scene.$charactersController);
        scene.$tilemap.create();
        //this.$levelBehavior.create();
        scene.$playerController.setOverworldPositionRaw(warpData);
        scene.$cameraController.setBounds();
        scene.$network.subscribeLevel(warpData.levelId);
    }
};

export default LevelManager;