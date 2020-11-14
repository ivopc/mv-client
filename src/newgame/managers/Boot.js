/*
* Boot.js
* class to control the game boot, to handle which scene we need to start, according to
* server payload data (initial base data to start the game) 
*/

import PlayerData from "@/newgame/managers/PlayerData";
import MapData from "@/newgame/managers/MapData";
import BattleData from "@/newgame/managers/BattleData";

// all possibles game states
const STATE = {
    OVERWORLD: 0,
    BATTLE: 1
};

class Boot {
    constructor (gameInstance, payload) {

        this.gameInstance = gameInstance;

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
            }
        };
    }

    initOverworld (payload) {
        const { map, monsters, items, sprite, position, notifications, wild, flag, tamers } = payload.param;
        PlayerData.ref = new PlayerData({
            character: { sprite, position },
            monsters, 
            items, 
            notifications
        });
        MapData.ref = new MapData({ map, flag, wild, tamers });
        this.gameInstance.start("boot", {
            state: "overworld"
        });
    }

    initBattle (payload) {
        BattleData.ref = new BattleData(/*{ ... }*/);
        this.gameInstance.start("boot", {
            state: "battle"
        });
    }

    async loadRunning (payload) {
        const Running = await import("@/newgame/subscene/running");
        this.gameInstance.scene.add("running", Running);
        this.gameInstance.start("boot", {
            state: "running"
        });
    }
};

export default Boot;