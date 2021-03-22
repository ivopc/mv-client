import { Scene } from "phaser";

class SceneManager {
    constructor () {
        this.overworld;
        this.level;
        this.battle;
    }

    setOverworld (scene) {
        this.overworld = scene;
    }

    setLevel (scene) {
        this.level = scene;
    }

    setBattle (scene) {
        this.battle = scene;
    }

    getOverworld () {
        return this.overworld;
    }

    getLevel () {
        return this.level;
    }

    getBattle () {
        return this.battle;
    }

    getCurrent () {}

    destroy (scene) {
        if (scene in this && this[scene] instanceof Scene) {
            this[scene].destroy();
            return true;
        };
        return false;
    }

    destroyAll () {
        Object.keys(this)
            .filter(attr => this[attr] instanceof Scene)
            .forEach(scene => this[scene].destroy());
    }

    static ref
};

export default SceneManager;