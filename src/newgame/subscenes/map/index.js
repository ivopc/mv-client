import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import Loader from "./Loader";
import InputListener from "./InputListener";
import Tilemap from "./Tilemap";
import Container from "./Container";

import PlayerCharacterController from "./PlayerCharacterController";
import InputController from "./InputController";

import MapData from "@/newgame/managers/MapData";

class Map extends Phaser.Scene {
    constructor () {
        super(SCENE.MAP);
    }

    init (params) {
        console.log("Olá");
    }

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {
        this.$inputListener = new InputListener(this);
        this.$inputController = new InputController(this);
        this.$containers = new Container(this);
        this.$tilemap = new Tilemap(this);
        this.$playerController = new PlayerCharacterController(this);
        // **-----------------------------------**
        this.$containers.create();
        this.$tilemap.assemble();
        this.$playerController.create();
    }

    update () {
        this.$inputListener.update();
    }
};

export default Map;