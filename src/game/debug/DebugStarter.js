class DebugStarter {
    static setup (game) {
        (globalThis || window).gameInstance = game;
    }
};

export default DebugStarter;