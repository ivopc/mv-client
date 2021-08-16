import RawLoader from "@/game/managers/RawLoader";
import AssetsStaticDatabase from "@/game/models/AssetsStaticDatabase";
import PlayerModel from "@/game/models/PlayerModel"; 

class Loader extends RawLoader {
    fetchAssets () {
        this.fetchLoaders(AssetsStaticDatabase.getUIComponents());
        PlayerModel.partyMonsters.list.forEach(monster => this.loadMonster(monster.monsterpedia_id));
        [1, 4, 7, 10, 12, 15, 18, 21].forEach(monsterpediaId => this.loadMonster(monsterpediaId)); // {placeholder}
    }
};

export default Loader;