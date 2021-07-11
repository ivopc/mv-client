import Phaser from "phaser";

import { SCENE } from "@/game/constants/GameScene";

import SceneManager from "@/game/managers/SceneManager";

import Loader from "./Loader";
import NetworkBattle from "./NetworkBattle";

class Battle extends Phaser.Scene {
    constructor () {
        super({ key: SCENE.BATTLE });
        // create static reference of current instance
        Battle.ref = this;
        this.$loader;
        this.$network;
    }

    init (params) {}

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {}

    /**
     * Static reference to self `Battle` scene instance
     * @type {Battle}
     */
     static ref
};

export default Battle;