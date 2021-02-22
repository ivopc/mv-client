import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import Loader from "./Loader";
import NetworkMap from "./NetworkMap";
import InputListener from "./InputListener";
import InputController from "./InputController";
import CameraController from "./CameraController";
import Tilemap from "./Tilemap";
import Container from "./Container";
import PlayerCharacterController from "./PlayerCharacterController";

import MapData from "@/newgame/managers/MapData";

class MapScene extends Phaser.Scene {
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
        this.$cameraController = new CameraController(this);
        this.$containers = new Container(this);
        this.$tilemap = new Tilemap(this);
        this.$playerController = new PlayerCharacterController(this);
        // **-----------------------------------**
        //this.$network.addListener();
        this.$cameraController.setup();
        this.$containers.create();
        this.$tilemap.create();
        this.$player = this.$playerController.create();
        this.$inputListener.addListener();
    }

    update (time) {
        this.$inputListener.update(time);
    }
};

export default MapScene;