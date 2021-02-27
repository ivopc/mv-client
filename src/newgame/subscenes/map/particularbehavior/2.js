import BaseLevelScript from "./BaseLevelScript";

class LevelScript extends BaseLevelScript {
	constructor (scene) {
		super();
		this.scene = scene;
	}

	add () {
		console.log("kkkkkkkkkk", this.scene);
	}
};

export default LevelScript;