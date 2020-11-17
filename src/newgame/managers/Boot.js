/*
* Boot.js
* class to control the game boot, to handle which scene we need to start, according to
* server payload data (initial base data to start the game), make singletons of a lot of
* manager classes
*/

import PlayerData from "@/newgame/managers/PlayerData";
import MapData from "@/newgame/managers/MapData";
import BattleData from "@/newgame/managers/BattleData";
import Network from "@/newgame/managers/Network";
import Layout from "@/newgame/managers/Layout";

import MonsterModel from "@/newgame/models/Monster";

// all game states to init
const STATE = {
    OVERWORLD: 0,
    BATTLE: 1
};

const monster = new MonsterModel({
    id: 1,
    uid: 1,
    monsterpediaId: 15,
    type: 0,
    shiny: true,
    isInitial: true,
    canTrade: false,
    nickname: "Ivinho",
    level: 100,
    experience: 9870389,
    gender: 0,
    moves: [24, 1, 6, 5],
    statusProblem: 0,
    stats: {
        hp: {
            current: 100,
            total: 120
        },
        mp: {
            current: 80,
            total: 100
        },
        attack: 387,
        defense: 250,
        speed: 399
    },
    dropPoints: {
        hp: 10,
        attack: 15,
        defense: 32,
        speed: 95
    },
    individualPoints: {
        hp: 31,
        attack: 31,
        defense: 31,
        speed: 31
    },
    vitamin: {
        hp: 0,
        attack: 0,
        defense: 0,
        speed: 0
    },
    item: {
        hold: 15,
        catch: 74
    },
    egg: {
        is: false,
        date: Date.now()
    }
});

console.log(monster);

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
        MapData.ref = new MapData({ map, flag, wild, tamers });
        this.gameInstance.scene.start("boot", {
            state: "overworld"
        });
    }

    initBattle (payload) {
        this.setPlayerData(payload);
        BattleData.ref = new BattleData(/*{ ... }*/);
        this.gameInstance.scene.start("boot", {
            state: "battle"
        });
    }

    async loadAndInitRunning (payload) {
        //const Running = await import("@/newgame/subscene/running");
        this.gameInstance.scene.add("running", Running);
        this.gameInstance.start("boot", {
            state: "running"
        });
    }

    setPlayerData (payload) {
        const { monsters, items, sprite, position, notifications, nickname } = payload.param;
        PlayerData.ref = new PlayerData({
            nickname,
            character: { sprite, position },
            monsters, 
            items, 
            notifications
        });
    }
};

export default Boot;