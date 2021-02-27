import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import SceneManager from "@/newgame/managers/SceneManager";

import Loader from "./Loader";
import NetworkMap from "./NetworkMap";
import InputListener from "./InputListener";
import InputController from "./InputController";
import CameraController from "./CameraController";
import Tilemap from "./Tilemap";
import Container from "./Container";
import PlayerCharacterController from "./PlayerCharacterController";

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
        this.$cameraController.setBounds();
        this.$playerController.create();
        this.$inputListener.addListener();
        SceneManager.ref.setLevel(this);
        console.log(SceneManager.ref);
    }

    update (time) {
        this.$inputListener.update(time);
    }
};

export default MapScene;