export const Extensor = {
    fetchById (id) {
        return this.find(monster => monster.id === id);
    },
    fetchBySpecie (specieId) {
        return this.filter(monster => monster.monsterpediaId === specieId);
    },
    getAllAlive () {
        return this.filter(monster => monster.isAlive);
    },
    isEmpty () {
        return this.length == 0;
    }
};