import Phaser from "phaser";

import { SCENE } from "@/game/constants/GameScene";

import SceneManager from "@/game/managers/SceneManager";

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

import { getPing } from "./network/ping.network";

class Level extends Phaser.Scene {
    constructor () {
        super({ key: SCENE.LEVEL });
        // create static reference of current instance
        Level.ref = this;
        this.$loader;
        // network need to be instancied here cause `Loader` depends 
        // on it for level channel subscribe success event
        this.$network = new NetworkLevel(this);
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
        this.$manager = new LevelManager(this);
        this.$inputListener = new InputListener(this);
        this.$inputController = new InputController(this);
        this.$cameraController = new CameraController(this);
        this.$containers = new Container(this);
        this.$tilemap = new Tilemap(this);
        this.$runtime = new RuntimeScript(this);
        this.$playerController = new PlayerCharacterController(this);
        this.$charactersController = new GenericCharactersController(this);
        //this.$lookerPathfind = new LookerPathfind(this);
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
        this.$inputListener.addListener();
        // tests
        //this.$runtime.run(this.$runtime.parse());
        //console.log(this.cache.tilemap.get("level_2"));
        this.$containers.test.add(this.add.image(0, 0, "_test").setOrigin(0, 0)); // {placeholder}
        this.test(); // {placeholder}
        this.time.addEvent({
            delay: 5000,
            callback: this.test,
            callbackScope: this,
            loop: true
        }); // {placeholder}
    }

    async test () {
        const { pingText } = this.scene.get(SCENE.OVERWORLD);
        const now = Date.now();
        await getPing();
        pingText.setText(`Ping: ${Date.now() - now}`);
    }

    update (time) {
        this.$inputListener.update(time);
    }

    /**
     * Static reference to self `Level` scene instance
     * @type {Level}
     */
    static ref
};

export default Level;