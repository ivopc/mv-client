import SceneManager from "./SceneManager";

class Audio {
    static get levelTheme () {
        return LevelData.ref;
    }

    static playLevelTheme (levelId) {
        SceneManager.getLevel();
    }

    static playMechanicSFX () {}

    static playUISFX () {}
};

export default Audio;