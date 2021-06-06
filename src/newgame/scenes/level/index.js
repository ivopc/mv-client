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
import RuntimeScript from "./RuntimeScript";
import PlayerCharacterController from "./PlayerCharacterController";
import GenericCharactersController from "./GenericCharactersController";
import LookerPathfind from "./LookerPathfind";

import { requestWildEncounter } from "./network/wild.network";

class Level extends Phaser.Scene {
    constructor () {
        super({ key: SCENE.LEVEL });
        this.$loader;
        this.$network;
        this.$manager;
        this.$inputListener;
        this.$inputController;
        this.$cameraController;
        this.$containers;
        this.$tilemap;
        this.$runtime;
        this.$playerController;
        this.$characterController;
        this.$lookerPathfinding;
        this.$levelBehavior;
    }

    init (params) {}

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
        this.$runtime = new RuntimeScript(this);
        this.$playerController = new PlayerCharacterController(this);
        this.$charactersController = new GenericCharactersController(this);
        //this.$lookerPathfinding = new LookerPathfind(this);
        // **-----------------------------------**
        this.$cameraController.setup();
        this.$containers.create();
        this.$tilemap.create();
        this.$cameraController.setBounds();
        this.$playerController.create();
        this.$network.addListener();
        // Level Behavior is instancied in Loader class
        this.$levelBehavior.create();
        this.$cameraController.setDefaultZoom();
        this.$network.subscribeLevel();
        this.$inputListener.addListener();
        SceneManager.setLevel(this);
        // tests
        //this.$runtime.run(this.$runtime.parse());
        this.lol();
    }

    async lol () {
        const data = await requestWildEncounter();
        console.log("wild", data);
    }

    update (time) {
        this.$inputListener.update(time);
    }
};

export default Level;