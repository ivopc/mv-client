/*
* PlayerData.js
* class to store and handle all player data received from server
*
*/

class PlayerData {

    constructor (data) {
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

    static ref
};

export default PlayerData;