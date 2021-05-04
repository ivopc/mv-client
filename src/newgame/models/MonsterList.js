class MonsterList extends Array {

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

export default MonsterList;