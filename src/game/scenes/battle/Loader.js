import RawLoader from "@/game/managers/RawLoader";

import { loadComplete } from "@/game/utils/scene.promisify";

class Loader extends RawLoader {
    fetchAssets () {
        const { scene } = this;
    }
};

export default Loader;