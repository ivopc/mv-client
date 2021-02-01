import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";

import Boot from "./scenes/boot";
import Overworld from "./scenes/overworld";
import Battle from "./scenes/battle";

import SubsceneMap from "./subscenes/map";

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
            width: 1280,
            height: 720
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
    gameInstance.scene.add(SCENE.BOOT, Boot);
    gameInstance.scene.add(SCENE.OVERWORLD, Overworld);
    gameInstance.scene.add(SCENE.MAP, SubsceneMap);
    gameInstance.scene.add(SCENE.BATTLE, Battle);
    return gameInstance;
};

export default launch;
export { launch };