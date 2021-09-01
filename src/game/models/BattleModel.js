import { BATTLE_TYPES } from "@/game/constants/Battle";

class BattleModel {
    static set (data) {
        this.props = data.battle;
        this.opponentMonsters = [];
        this.setOpponentMonsters(data);
    }

    static setOpponentMonsters (data) {
        switch (data.battle.battle_type) {
            case BATTLE_TYPES.WILD: {
                this.opponentMonsters = data.wildMonster;
                break;
            };
        };
    }

    static getCurrentOpponentMonster () {
        switch (this.props.battle_type) {
            case BATTLE_TYPES.WILD: {
                return this.opponentMonsters;
            };
        }
    }

    static clear () {
        this.opponentMonsters = null;
        this.props = null;
    }
};

export default BattleModel;