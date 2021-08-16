import { game } from "@/game";
import SceneManager from "./SceneManager";
import UInterfaceContainer from "@/game/uinterfaces/components/generics/UInterfaceContainer";

class LayoutResponsivityManager {

    static addListener () {
        game.scale.on("resize", this.resizeEvent.bind(this));
    }

    static resizeEvent () {
        SceneManager.getOverworld().children.list
            .filter(child => child instanceof UInterfaceContainer)
            .forEach(container => container.resize( ... arguments));
    }

    static normalizeGameObject (gameObject) {
        gameObject.scale = 1;
        if (
            "normalizePosition" in gameObject &&
            typeof(gameObject.normalizePosition) === "function"
        )
            gameObject.normalizePosition();
    }

    static fitToFullScreen (gameObject, gameObjectSize, gameSize) {
        const scale = {
            x: gameSize.width / gameObjectSize.width,
            y: gameSize.height / gameObjectSize.height
        };
        const remainderX = scale.x < 1 ? 1 - scale.x : 0;
        gameObject.scaleX = scale.x + remainderX;
        gameObject.scaleY = Math.max(scale.x, scale.y);
        /*console.log("dimension authenticity scale test", {
            widthWithScale: gameObjectSize.width * gameObject.scaleX, 
            heightWithScale: gameObjectSize.height * gameObject.scaleY
        });*/
        gameObject.setPosition(0, 0);
    }
};

export default LayoutResponsivityManager;