import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import Loader from "./Loader";
import NetworkMap from "./NetworkMap";
import InputListener from "./InputListener";
import InputController from "./InputController";
import Tilemap from "./Tilemap";
import Container from "./Container";
import PlayerCharacterController from "./PlayerCharacterController";

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
        this.$network = new NetworkMap(this);
        this.$inputListener = new InputListener(this);
        this.$inputController = new InputController(this);
        this.$containers = new Container(this);
        this.$tilemap = new Tilemap(this);
        this.$playerController = new PlayerCharacterController(this);
        // **-----------------------------------**
        //this.$network.listen();
        this.$inputListener.addListener();
        this.$containers.create();
        this.$tilemap.assemble();
        this.cameras.main.roundPixels = true;
        this.cameras.main.setZoom(2);
        this.cameras.main.width = 1280;
        this.cameras.main.height = 720;
        this.cameras.main.x = 0;
        this.cameras.main.y = 0;

        console.log(this.cameras.main);
        window.camera = this.cameras.main;
        this.$playerController.create();
    }

    update () {
        this.$inputListener.update();
    }
};

export default Map;