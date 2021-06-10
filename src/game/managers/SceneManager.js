import { Scene } from "phaser";

class SceneManager {
    static overworld;
    static level;
    static battle;

    static setOverworld (scene) {
        this.overworld = scene;
    }

    static setLevel (scene) {
        this.level = scene;
    }

    static setBattle (scene) {
        this.battle = scene;
    }

    static getOverworld () {
        return this.overworld;
    }

    static getLevel () {
        return this.level;
    }

    static getBattle () {
        return this.battle;
    }

    static getCurrent () {}

    static destroy (scene) {
        if (scene in this && this[scene] instanceof Scene) {
            this[scene].destroy();
            return true;
        };
        return false;
    }

    static destroyAll () {
        Object.keys(this)
            .filter(attr => this[attr] instanceof Scene)
            .forEach(scene => this[scene].destroy());
    }
};

export default SceneManager;