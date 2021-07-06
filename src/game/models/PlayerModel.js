import { treatMonsterList } from "@/game/utils";

class PlayerModel {
    static create ({ nickname, character, monsters, items, notification }) {
        this.nickname = nickname;
        this.character = character;
        this.partyMonsters = treatMonsterList(monsters);
        this.items = items;
        this.notification = notification;
    }

    static setPosition ({ x, y, facing }) {
        this.character.position = { x, y, facing };
    }

    static setFacing (direction) {
        this.character.position.facing = direction;
    }
};

export default PlayerModel;