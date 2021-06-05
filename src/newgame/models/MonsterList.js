/*
for es6 and webpack reasons extending the MonsterList as 
`MonsterList extends Array` isn't working cause it's exclusive to es6,
so we're using this provisional solution
*/

class MonsterList {
    
    constructor (monsterList) {
        this.monsterList = monsterList;
    }

    get (index) {
        return this.monsterList[index];
    }

    fetchById (id) {
        return this.monsterList.find(monster => monster.id === id);
    }

    fetchBySpecie (specieId) {
        return this.monsterList.filter(monster => monster.monsterpedia_id === specieId);
    }

    getAllAlive () {
        return this.monsterList.filter(monster => monster.isAlive);
    }

    isEmpty () {
        return this.monsterList.length === 0;
    }
}

/*
class MonsterList extends Array {

    constructor (monsters) {
        super( ... monsters);
    }

    fetchById (id) {
        return this.find(monster => monster.id === id);
    }

    fetchBySpecie (specieId) {
        return this.filter(monster => monster.monsterpedia_id === specieId);
    }

    getAllAlive () {
        return this.filter(monster => monster.isAlive);
    }

    isEmpty () {
        return this.length === 0;
    }
};
*/

export default MonsterList;