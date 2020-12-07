import PlayerData from "@/newgame/managers/PlayerData";

class RawLoader {
    constructor (scene) {
        this.scene = scene;
        if (!RawLoader.alreadyLoadedBase)
            this.fetchBaseAssets();
        scene.load.setBaseURL(process.env.gameClientBaseURL);
    }

    asyncAssetLoad () {}

    fetchBaseAssets () {
        return;
        const scene = this.scene;
        // load all player monsters
        PlayerData.ref.partyMonsters.forEach(monster => this.loadMonster(monster.monsterpediaId));
        // load ui sprites that we need to use in all scenes
        scene.load.spritesheet("button", "assets/img/battle/button_spritesheet.png", {frameWidth: 105, frameHeight: 38});
        scene.load.image("loading", "assets/img/interface/loading.png");
        scene.load.atlas("types", "assets/img/interface/types.png", "assets/res/types.json");
        scene.load.atlas("status-problem", "assets/img/interface/status_problem.png", "assets/res/status_problem.json");
        RawLoader.alreadyLoadedBase = true;
    }

    loadMonster (monsterpediaId) {
        this.scene.load.atlas(
            "monster_" + monsterpediaId + "_overworld",
            "assets/img/monsters/overworld/" + monsterpediaId + ".png",
            "assets/atlas/monster_" + monsterpediaId + "_overworld.json"
        );

        this.scene.load.atlas(
            "monster_" + monsterpediaId, 
            "assets/img/monsters/" + monsterpediaId + ".png", 
            "assets/atlas/monster_" + monsterpediaId + ".json"
        );
    }

    // static flag to don't need to load base assets again
    static alreadyLoadedBase = false
};

export default RawLoader;