import Phaser from "phaser";

class InitialMonster extends Phaser.GameObjects.Container {
    constructor (scene, x, y, children) {
        super(scene, x, y, children);
    }
}