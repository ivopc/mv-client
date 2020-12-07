/*
* PlayerData.js
* class to store and handle all player data received from server
*/

class PlayerData {

    constructor (data) {
        this.nickname = data.nickname;
        this.character = data.character;
        this.partyMonsters = data.monsters;
        this.items = data.items;
        this.notifications = data.notifications;
    }

    get data () {
        const { nickname, character, partyMonsters, items, notifications } = this;
        return { nickname, character, partyMonsters, items, notifications };
    }

    static ref
};

export default PlayerData;