/*
* Boot.js
* class to control the game boot, to handle which scene we need to start, according to
* server payload data (initial base data to start the game), make singletons of a lot of
* manager classes
*/
import { STATE } from "@/newgame/constants/GameBootStates";
import { SCENE } from "@/newgame/constants/GameScene";

import PlayerData from "./PlayerData";
import LevelData from "./LevelData";
import BattleData from "./BattleData";
import Network from "./Network";

class Boot {
    constructor (gameInstance, socket, payload) {
        this.gameInstance = gameInstance;
        Network.ref = new Network(socket);
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
        this.setPlayerData(payload);
        const { map, wild, flag, tamers } = payload.param;
        LevelData.ref = new LevelData({ map, flag, wild, tamers });
        this.gameInstance.scene.start(SCENE.BOOT, {
            scene: SCENE.OVERWORLD
        });
    }

    initBattle (payload) {
        this.setPlayerData(payload);
        BattleData.ref = new BattleData(/*{ ... }*/);
        this.gameInstance.scene.start(SCENE.BOOT, {
            scene: SCENE.BATTLE
        });
    }

    async loadAndInitRunning (payload) {
        //const Running = await import("@/newgame/subscene/running");
        this.gameInstance.scene.add("running", Running);
        this.gameInstance.start("boot", {
            scene: "running"
        });
    }

    setPlayerData (payload) {
        const { monsters, items, sprite, position, notify, nickname } = payload.param;
        PlayerData.ref = new PlayerData({
            nickname,
            character: { sprite, position },
            monsters, 
            items, 
            notify
        });
    }
};

export default Boot;