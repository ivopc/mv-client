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

    addFollower (gameObject) {
        this.followers[gameObject.id] = gameObject;
    }

    addRemotePlayer (gameObject) {
        this.remotePlayers[gameObject.id] = gameObject;
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