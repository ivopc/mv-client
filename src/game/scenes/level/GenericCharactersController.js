import Character from "@/game/prefabs/Character";
import RemotePlayer from "@/game/prefabs/RemotePlayer";

import { CHAR_TYPES } from "@/game/constants/Character";
import { 
    OVERWORLD_ACTIONS, 
    CHARACTER_OVERWORLD_ACTIONS_HASH,
    LEVEL_P2P_STRUCT
} from "@/game/constants/NetworkEvents";

class GenericCharactersController {
    constructor (scene) {
        this.scene = scene; //$charactersController
        this.staticCharacters = {};
        this.followers = {};
        this.remotePlayers = {};
        console.log(this);
    }

    addStaticCharacter (gameObject) {
        this.staticCharacters[gameObject._data.name] = gameObject;
        this.scene.$tilemap.objectsMap.add(
            gameObject, 
            gameObject._data.position
        );
    }

    getStaticCharacter (name) {
        return this.staticCharacters[name];
    }

    addFollower (gameObject) {
        this.followers[gameObject._data.id] = gameObject;
    }
    

    handleRemotePlayerData (payload) {
        switch (payload[LEVEL_P2P_STRUCT.ACTION_TYPE]) {
            case OVERWORLD_ACTIONS.MOVE:
            case OVERWORLD_ACTIONS.FACING:
            {
                // checking if remote player isn't in level
                if ( !(payload[LEVEL_P2P_STRUCT.USER_ID] in this.remotePlayers) ) {
                    this.addRemotePlayer(payload);
                    return;
                };
                this.getRemotePlayer(payload[LEVEL_P2P_STRUCT.USER_ID]).dispatchAction(payload);
                break;
            };
        }
    }

    getRemotePlayer (userId) {
        return this.remotePlayers[userId];
    }

    addRemotePlayer (playerData) {
        RemotePlayer.addToLevel(this.scene, {
            type: CHAR_TYPES.ONLINE_PLAYER,
            position: {
                x: playerData[LEVEL_P2P_STRUCT.X],
                y: playerData[LEVEL_P2P_STRUCT.Y],
                facing: playerData[LEVEL_P2P_STRUCT.DIRECTION]
            },
            sprite: playerData[LEVEL_P2P_STRUCT.CHARACTER],
            nickname: playerData[LEVEL_P2P_STRUCT.NICKNAME],
            userId: playerData[LEVEL_P2P_STRUCT.USER_ID]
        });
    }

    addRemotePlayerGameObject (gameObject, userId) {
        this.remotePlayers[userId] = gameObject;
    }

    getFollower (id) {
        return this.followers[id];
    }

    removeFollower (id) {
        this.followers[id].destroy();
        delete this.followers[id];
    }

    clear () {
        Object.values(this.staticCharacters).forEach(character => character.destroy());
        Object.values(this.followers).forEach(follower => follower.destroy());
        Object.values(this.remotePlayers).forEach(remotePlayer => remotePlayer.destroy());
        this.staticCharacters = {};
        this.followers = {};
        this.remotePlayers = {};
    }
};

export default GenericCharactersController;