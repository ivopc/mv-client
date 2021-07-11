import Layout from "@/game/managers/Layout";

import UInterfaceContainer from "./components/generics/UInterfaceContainer";

class RemoteProfile extends UInterfaceContainer {
    constructor (scene) {
        super(scene, Layout.ref.get("remoteProfile"));
    }

    append () {

    }
};

export default RemoteProfile;