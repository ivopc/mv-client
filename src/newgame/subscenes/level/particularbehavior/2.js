import BaseLevelScript from "./BaseLevelScript";

class LevelScript extends BaseLevelScript {
	constructor (scene) {
		super(scene);
	}

	add () {
		console.log("kkkkkkkkkk", this.scene);
	}
};

export default LevelScript;