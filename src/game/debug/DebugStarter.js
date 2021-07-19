class DebugStarter {
    static setup (game) {
        (globalThis || window).game = game;
    }
};

export default DebugStarter;