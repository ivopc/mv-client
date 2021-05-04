import Character from "@/newgame/prefabs/Character";

import { CHAR_TYPES } from "@/newgame/constants/Character";
import { 
    OVERWORLD_ACTIONS, 
    CHARACTER_OVERWORLD_ACTIONS_HASH 
} from "@/newgame/constants/NetworkLevelEvents";

/*remote player data coming from server = {
    "dir": 3,
    "dataType": 1,
    "uid": 2,
    "pos": {
        "x": 12,
        "y": 23
    },
    "char": 2,
    "nickname": "SouXiterMex1"
}*/

class GenericCharactersController {
    constructor (scene) {
        this.scene = scene; //$charactersController
        this.staticCharacters = {};
        this.followers = {};
        this.remotePlayers = {};
    }

    addStaticCharacter (gameObject) {
        this.staticCharacters[gameObject.name] = gameObject;
        this.scene.$tilemap.objectsMap.add(
            gameObject, 
            gameObject._data.position
        );
    }

    getStaticCharacter (name) {
        return this.staticCharacters[name];
    }

    addFollower (gameObject) {
        this.followers[gameObject.id] = gameObject;
    }

    handleRemotePlayerData (payload) {
        switch (payload.dataType) {
            case OVERWORLD_ACTIONS.MOVE:
            case OVERWORLD_ACTIONS.FACE:
            {
                payload.type = CHAR_TYPES.ONLINE_PLAYER;
                // checking if remote player isn't in level
                if ( !(payload.uid in this.remotePlayers) ) {
                    this.addRemotePlayer(payload);
                    return;
                };
                this.remotePlayers[payload.uid][CHARACTER_OVERWORLD_ACTIONS_HASH[payload.dataType]](payload.dir);
                break;
            };
        }
    }

    addRemotePlayer (playerData) {
        const gameObject = new Character(this.scene, {
            type: playerData.type,
            position: {
                x: playerData.pos.x,
                y: playerData.pos.y,
                facing: playerData.dir
            },
            sprite: playerData.char,
            nickname: playerData.nickname
        });
        this.remotePlayers[playerData.uid] = gameObject;
        this.scene.$containers.main.add(gameObject);
    }

    getFollower (id) {
        return this.followers[id];
    }

    removeFollower (id) {
        this.followers[id].destroy();
        delete this.followers[id];
    }

    clear () {
        Object.keys(this.staticCharacters)
            .forEach(staticCharacter => this.staticCharacters[staticCharacter].destroy());
        Object.keys(this.followers)
            .forEach(follower => this.followers[follower].destroy());
        Object.keys(this.remotePlayers)
            .forEach(remotePlayer => this.remotePlayers[remotePlayer].destroy());
        this.staticCharacters = {};
        this.followers = {};
        this.remotePlayers = {};
    }
};

export default GenericCharactersController;