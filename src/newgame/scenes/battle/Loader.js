import RawLoader from "@/newgame/managers/RawLoader";
import Database from "@/newgame/managers/Database";
import Assets from "@/newgame/managers/Assets";
import PlayerData from "@/newgame/managers/PlayerData";

import { loadComplete } from "@/newgame/utils/scene.promisify";

class Loader extends RawLoader {
    fetchAssets () {
        const { scene } = this;
    }
};

export default Loader;