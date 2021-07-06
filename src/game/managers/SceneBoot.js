/*
* SceneBoot.js
* class to control the scene boot, to handle which scene we need to start, according to
* server payload data (initial base data to start the scenes), make singletons of a lot of
* manager classes
*/
import { STATE } from "@/game/constants/GameBootStates";
import { SCENE } from "@/game/constants/GameScene";

import PlayerData from "./PlayerData";
import LevelData from "./LevelData";
import BattleData from "./BattleData";

import PlayerModel from "@/game/models/PlayerModel";
import LevelModel from "@/game/models/LevelModel";
import BattleModel from "@/game/models/BattleModel";

import { game } from "@/game";

class SceneBoot {
    constructor (payload) {
        switch (payload.state) {
            case STATE.OVERWORLD: {
                this.initOverworld(payload);
                break;
            };
            case STATE.BATTLE: {
                this.initBattle(payload);
                break;
            };
            // only test, calm down
            case STATE.RUNNING: {
                this.loadRunning(payload);
                break;
            };
        };
    }

    initOverworld (payload) {
        this.setPlayerModelData(payload);
        const { level, wild, flag, tamers } = payload.param;
        LevelData.ref = new LevelData({ level, flag, wild, tamers }); // {legacy}
        LevelModel.create({ level, flag, wild, tamers });
        game.scene.start(SCENE.BOOT, {
            scene: SCENE.OVERWORLD
        });
    }

    initBattle (payload) {
        this.setPlayerModelData(payload);
        BattleData.ref = new BattleData(/*{ ... }*/); // {legacy}
        BattleModel.create(/*{ ... }*/);
        game.scene.start(SCENE.BOOT, {
            scene: SCENE.BATTLE
        });
    }

    async loadAndInitRunning (payload) {
        //const Running = await import("@/game/subscene/running");
        game.scene.add("running", Running);
        game.start("boot", {
            scene: "running"
        });
    }

    setPlayerModelData (payload) {
        const { monsters, items, sprite, position, notification, nickname } = payload.param;
        PlayerData.ref = new PlayerData({
            nickname,
            character: { sprite, position },
            monsters, 
            items, 
            notification
        }); // {legacy}
        PlayerModel.create({
            nickname,
            character: { sprite, position },
            monsters, 
            items, 
            notification
        });
    }
};

export default SceneBoot;