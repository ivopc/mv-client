import RawLoader from "@/game/managers/RawLoader";
import Assets from "@/game/managers/Assets"; // {legacy}
import PlayerData from "@/game/managers/PlayerData"; // {legacy}

class Loader extends RawLoader {
    fetchAssets () {
        this.fetchLoaders(Assets.ref.getUIComponents());
    }
};

export default Loader;