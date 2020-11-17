/*
* PlayerData.js
* class to store and handle all player data received from server
*/

class PlayerData {

    constructor (data) {
        this.nickname = data.nickname;
        this.character = data.character;
        this.monsters = data.monsters;
        this.items = data.items;
        this.notifications = data.notifications;
    }

    fetchMonsterByIndex (index) {
        return this.monsters[index];
    }

    fetchMonsterById(id) {
       return this.monsters.find(monster => monster.id == id);
    }

    fetchMonstersBySpecie (specieId) {
        return this.monsters.filter(monster => monster.monsterpedia_id == specieId);
    }

    get data () {
        const { nickname, character, monsters, items, notifications } = this;
        return { nickname, character, monsters, items, notifications };
    }

    static ref
};

export default PlayerData;