import Phaser from "phaser";

import Input from "./Input";

import PlayerData from "@/newgame/managers/PlayerData";

class Map extends Phaser.Scene {
    constructor () {
        super("map");
    }

    init (params) {}

    preload () {}

    create () {
        this._input = new Input(this);
    }

    addPlayer () {

        const { character } = PlayerData.ref;
        
        this.player = new Player(this, {
            position: {
                x: character.position.x,
                y: character.position.y,
                facing: character.position.facing
            },
            sprite: character.sprite
        });

        this.player.cameraFollow();
    }

    update () {
        this._input.update();
    }
};

export default Map;