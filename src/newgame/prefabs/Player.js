import Character from "./Character";

class Player extends Character {
    constructor (scene, data) {
        super(scene, data);
        this._data.isPlayer = true;
        this._data.stop = data.stop || false;
    }

    sendWalk (direction) {}

    sendFacing (direction) {}

    cameraFollow () {
	    this.scene.cameras.main.disableCull = false;

	    // make camera follow the player
	    this.scene.cameras.main.setBounds(0, 0, this.scene.map.widthInPixels, this.scene.map.heightInPixels);
	    this.scene.cameras.main.startFollow(this, true, 1, 1);
    }
};

export default Player;