import MonsterModel from "./Monster";
import MonsterInPartyModel from "./MonsterInParty";
import ExtendModelInstance from "./lib/ExtendModelInstance";
import MonsterListExtends from "./lib/MonsterListExtends";

const monsters = [
	new MonsterModel({
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
	            current: 57,
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
	        date: new Date()
	    }
	}),
	new MonsterModel({
	    id: 99,
	    uid: 1,
	    monsterpediaId: 65,
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
	            current: 0,
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
	        date: new Date()
	    }
	}),
	new MonsterModel({
	    id: 25,
	    uid: 1,
	    monsterpediaId: 43,
	    type: 0,
	    shiny: false,
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
	            current: 30,
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
	        date: new Date()
	    }
	})
];

const rawMonstersInParty = new MonstersInParty(monsters);
const monstersInParty = ExtendModelInstance(rawMonstersInParty, MonsterListExtends);

console.log(monstersInParty.getAllAlive());


// pseudo-code to make a monster model list of MonstersInParty
;(function (payload) {
    const monsters = payload.monsters.map(monster => new MonsterModel(monster));
    this.monsterList = ExtendModelInstance(
    	new MonstersInParty(monsters), 
    	MonsterListExtends
    );
})();

