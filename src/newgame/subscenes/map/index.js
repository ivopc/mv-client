import Phaser from "phaser";

import Input from "./Input";
import Loader from "./Loader";

import Player from "@/newgame/prefabs/Player";

import PlayerData from "@/newgame/managers/PlayerData";
import MapData from "@/newgame/managers/MapData";




class Map extends Phaser.Scene {
    constructor () {
        super("map");
    }

    init (params) {}

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {
        this.$input = new Input(this);
        //this.addPlayer();
        console.log("player data", PlayerData.ref.data);
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
        this.$input.update();
    }
};

export default Map;