import Phaser from "phaser";

import Boot from "./scenes/boot";
import Overworld from "./scenes/overworld";
import Battle from "./scenes/battle";

import OverworldMap from "./subscenes/map";

import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin.js";

function launch (containerId) {
    // game core instance
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

    // add scenes to game instances
    gameInstance.scene.add("boot", Boot);
    gameInstance.scene.add("overworld", Overworld);
    gameInstance.scene.add("map", OverworldMap);
    gameInstance.scene.add("battle", Battle);
    return gameInstance;
};

export default launch;
export { launch };