import Layout from "@/game/managers/Layout";

import InterfaceContainer from "./components/InterfaceContainer";

class RemoteProfile extends InterfaceContainer {
    constructor (scene) {
        super(scene, Layout.ref.get("remoteProfile"));
    }

    append () {

    }
};

export default RemoteProfile;