import Layout from "@/game/managers/Layout"; // {legacy}

import RuntimeUI from "./RuntimeUI";

class RemoteProfile extends RuntimeUI {
    constructor (scene) {
        super(scene, "profile"); // {legacy}
    }

    append () {
        super.append();
    }
};

export default RemoteProfile;