import Phaser from "phaser";

import Boot from "./scenes/boot";
import Overworld from "./scenes/overworld/main";
import Battle from "./scenes/battle/main";

import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin.js";

const launch = function (containerId) {
    // instanciando carregamento do jogo
    const gameInstance = new Phaser.Game({
        type: Phaser.WEBGL,
        autoStart: false,
        scale: {
            mode: Phaser.Scale.FIT,
            parent: containerId,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 480,
            height: 240
        },
        autoRound: false,
        plugins: {
            global: [
                {
                    key: "rexDrag",
                    plugin: DragPlugin,
                    start: true
                }
            ],
            scene: [
                {
                    key: "rexUI",
                    plugin: RexUIPlugin,
                    mapping: "rexUI"
                }
            ]
        }
    });

    // cenas
    const Scene = {};

    // adicionando boot
    Scene.Boot = new Phaser.Class(Boot);   

    // adicionando scenes do jogo
    Scene.Overworld = new Phaser.Class(Overworld);
    Scene.Battle = new Phaser.Class(Battle);

    // adicionando scenes a instancia do jogo
    gameInstance.scene.add("boot", Scene.Boot);
    gameInstance.scene.add("overworld", Scene.Overworld);
    gameInstance.scene.add("battle", Scene.Battle);

    return gameInstance;
};

export default launch;
export { launch };