import { ArrayModel } from "objectmodel";
import MonsterModel from "./Monster";

const 
    partyMaxMonsters = 6,
    partyMaxMonstersArray = new Array(partyMaxMonsters + 1)
        .fill(null)
        .map((el, i) => i);

export const MonstersInParty = new ArrayModel([MonsterModel, null])
    .extend()
    .assert(list => 
        partyMaxMonstersArray.includes(list.length), 
        "Should have 0 between 6 MonsterModel elements of list"
    );

// pseudo-code to make a monster model list of MonstersInParty
;(function (payload) {
    const monsters = payload.monsters.map(monster => new MonsterModel(monster));
    this.monstersList = new MonstersInParty(monsters);
})();