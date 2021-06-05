import { game } from "@/newgame";

import SceneManager from "./SceneManager";

import InterfaceContainer from "@/newgame/uinterfaces/components/InterfaceContainer";

class LayoutResponsivityManager {

    static addListener () {
        game.scale.on("resize", this.resize.bind(this));
    }

    static resize ( ... args) {
        SceneManager.getOverworld().children.list
            .filter(child => child instanceof InterfaceContainer)
            .forEach(interfaceContainer => interfaceContainer.resize( ... args));
    }
};

export default LayoutResponsivityManager;