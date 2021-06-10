/*
* PlayerData.js
* class to store and handle all player data received from server
*/

import { treatMonsterList } from "@/game/utils";

class PlayerData {

    constructor (data) {
        this.nickname = data.nickname;
        this.character = data.character;
        this.partyMonsters = treatMonsterList(data.monsters);
        this.items = data.items;
        this.notifications = data.notification;
    }

    setPosition ({ x, y, facing }) {
        this.character.position = { x, y, facing };
    }

    setFacing (direction) {
        this.character.position.facing = direction;
    }

    get data () {
        const { nickname, character, partyMonsters, items, notifications } = this;
        return { nickname, character, partyMonsters, items, notifications };
    }

    static ref
};

export default PlayerData;