import RawLoader from "@/newgame/managers/RawLoader";
import Assets from "@/newgame/managers/Assets";
import PlayerData from "@/newgame/managers/PlayerData";

class Loader extends RawLoader {

    fetchAssets () {
        const { scene } = this;
        this.fetchLoaders(Assets.ref.getUIComponents());
    }
};

export default Loader;