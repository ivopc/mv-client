import { Scene } from "phaser";
const Boot = {};

Boot.Extends = Scene;

Boot.initialize = function () {
    Scene.call(this, {key: "boot"});
};

Boot.init = function (data) {
    this.data = data;
};

Boot.preload = function () {
    this.load.setBaseURL(process.env.gameClientBaseURL);
    this.load.image("load_background", "assets/img/load_screen.png");
    this.load.json("database", "assets/res/database.json");
};

Boot.create = function () {
    this.scene.start(this.data.state, this.data);
};

export default Boot;