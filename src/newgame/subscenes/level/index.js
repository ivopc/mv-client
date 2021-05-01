import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import SceneManager from "@/newgame/managers/SceneManager";

import Loader from "./Loader";
import LevelManager from "./LevelManager";
import NetworkLevel from "./NetworkLevel";
import InputListener from "./InputListener";
import InputController from "./InputController";
import CameraController from "./CameraController";
import Tilemap from "./Tilemap";
import Container from "./Container";
import PlayerCharacterController from "./PlayerCharacterController";

class LevelScene extends Phaser.Scene {
    constructor () {
        super(SCENE.LEVEL);
        this.$loader;
        this.$network;
        this.$manager;
        this.$inputListener;
        this.$inputController;
        this.$cameraController;
        this.$containers;
        this.$tilemap;
        this.$playerController;
        this.$levelBehavior;
    }

    init (params) {
        console.log("Olá");
    }

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {
        this.$network = new NetworkLevel(this);
        this.$manager = new LevelManager(this);
        this.$inputListener = new InputListener(this);
        this.$inputController = new InputController(this);
        this.$cameraController = new CameraController(this);
        this.$containers = new Container(this);
        this.$tilemap = new Tilemap(this);
        this.$playerController = new PlayerCharacterController(this);
        // **-----------------------------------**
        this.$cameraController.setup();
        this.$containers.create();
        this.$tilemap.create();
        this.$cameraController.setBounds();
        this.$playerController.create();
        //this.$network.addListener();
        // Level Behavior is instancied in Loader class
        this.$levelBehavior.create();
        this.$inputListener.addListener();
        SceneManager.ref.setLevel(this);
    }

    update (time) {
        this.$inputListener.update(time);
    }
};

export default LevelScene;