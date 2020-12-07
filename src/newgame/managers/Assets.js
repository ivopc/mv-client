import Database from "./Database";

const RESOLUTIONS = {
    FULL_HD: 0,
    HD: 1,
    STANDARD: 2,
    MOBILE: 3
};

class Assets {

    getOverworldCharacter (id) {
        const character = Database.ref.character[id];
        return {
            key: character.atlas, 
            sprite: `assets/img/characters/${character.atlas}.png`, 
            atlas: `atlas/${character.atlas}.json`
        };
    }

    getMapCharacters (id) {
        return Database.ref.maps[id].npcs
            .map(npc => this.getOverworldCharacter(npc.id));
    }

    getMapTilemap (id) {
        const map = Database.ref.maps[id];
        return {
            key: "level_" + map.name,
            src: `assets/maps/${map.name}.json`
        };
    }

    getMapTilesets (id) {
        return Database.ref.maps[this.id].tiles;
    }

    getMapMainMusic (id) {
        const map = Database.ref.maps[id];
        return {
            key: map.music.name,
            src: "assets/audio/" + map.music.src
        };
    }

    getUiComponent (key) {}

    static ref
};

export default Assets;