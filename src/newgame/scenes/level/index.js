import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import SceneManager from "@/newgame/managers/SceneManager";

import Loader from "./Loader";
import LevelManager from "./LevelManager";
import NetworkLevelListener from "./NetworkLevelListener";
import InputListener from "./InputListener";
import InputController from "./InputController";
import CameraController from "./CameraController";
import Tilemap from "./Tilemap";
import Container from "./Container";
import RuntimeScripting from "./RuntimeScripting";
import PlayerCharacterController from "./PlayerCharacterController";
import GenericCharactersController from "./GenericCharactersController";
import LookerPathfinding from "./LookerPathfinding";

class Level extends Phaser.Scene {
    constructor () {
        super(SCENE.LEVEL);
        this.$loader = new Loader(this);
        this.$network = new NetworkLevelListener(this);
        this.$manager = new LevelManager(this);
        this.$inputListener = new InputListener(this);
        this.$inputController = new InputController(this);
        this.$cameraController = new CameraController(this);
        this.$containers = new Container(this);
        this.$tilemap = new Tilemap(this);
        this.$runtime = new RuntimeScripting(this);
        //this.$lookerPathfinding = new LookerPathfinding(this);
        this.$playerController = new PlayerCharacterController(this);
        this.$charactersController = new GenericCharactersController(this);
    }

    init (params) {}

    preload () {
        this.$loader.fetchAssets();
    }

    create () {
        this.$cameraController.setup();
        this.$containers.create();
        this.$tilemap.create();
        this.$cameraController.setBounds();
        this.$playerController.create();
        this.$network.addListener();
        // Level Behavior is instantied in Loader class
        this.$levelBehavior.create();
        this.$network.subscribeLevel();
        this.$inputListener.addListener();
        SceneManager.ref.setLevel(this);
        // tests
        //this.$runtime.run(this.$runtime.parse());
    }

    update (time) {
        this.$inputListener.update(time);
    }
};

export default Level;