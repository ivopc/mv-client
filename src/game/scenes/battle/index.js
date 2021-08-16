import { Scene } from "phaser";

import { SCENE } from "@/game/constants/GameScene";

import SceneManager from "@/game/managers/SceneManager";

import Loader from "./Loader";

class Battle extends Scene {
    constructor () {
        super({ key: SCENE.BATTLE });
        // create static reference of current instance
        SceneManager.setBattle(this);
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