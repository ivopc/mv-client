import { Scene } from "phaser";

import { SCENE } from "@/game/constants/GameScene";

import SceneManager from "@/game/managers/SceneManager";

import BattleModel from "@/game/models/BattleModel";

import Loader from "./Loader";
import Container from "./Container";
import Field from "./Field";
import Presentation from "./Presentation";
import BattleUI from "@/game/uinterfaces/Battle";

class Battle extends Scene {
    constructor () {
        super({ key: SCENE.BATTLE });
        // create static reference of current scene instance
        SceneManager.setBattle(this);
        this.$loader;
        this.$network;
        this.$containers;
        this.$field;
        this.$presentation;
    }

    init (battleData) {
        BattleModel.set(battleData);
    }

    preload () {
        this.$loader = new Loader(this);
        this.$loader.fetchAssets();
    }

    create () {
        this.$containers = new Container(this);
        this.$field = new Field(this);
        this.$presentation = new Presentation(this);
        // ---
        this.$containers.create();
        [this.$field].forEach(container => container.addToMainContainer());
        this.$field.addField();
        this.$field.addFloors();
        this.$field.addMonsters();
        new BattleUI(this).append();
    }
};

export default Battle;