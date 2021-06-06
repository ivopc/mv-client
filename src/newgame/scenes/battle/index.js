import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import SceneManager from "@/newgame/managers/SceneManager";

import Loader from "./Loader";
import NetworkBattle from "./NetworkBattle";

class Battle extends Phaser.Scene {
    constructor () {
        super({ key: SCENE.BATTLE });
        this.$loader;
        this.$network;
    }

    init (params) {}

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {}
};

export default Battle;