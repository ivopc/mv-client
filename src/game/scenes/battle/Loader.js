import RawLoader from "@/game/managers/RawLoader";
import Database from "@/game/managers/Database";
import Assets from "@/game/managers/Assets";
import PlayerData from "@/game/managers/PlayerData";

import { loadComplete } from "@/game/utils/scene.promisify";

class Loader extends RawLoader {
    fetchAssets () {
        const { scene } = this;
    }
};

export default Loader;