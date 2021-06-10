import RawLoader from "@/game/managers/RawLoader";
import Assets from "@/game/managers/Assets";
import PlayerData from "@/game/managers/PlayerData";

class Loader extends RawLoader {

    fetchAssets () {
        const { scene } = this;
        this.fetchLoaders(Assets.ref.getUIComponents());
    }
};

export default Loader;