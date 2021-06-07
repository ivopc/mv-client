import Phaser from "phaser";

import { SCENE } from "@/newgame/constants/GameScene";
import { RESOLUTION_TYPES, RESOLUTION_SIZES } from "@/newgame/constants/Resolutions";

import SceneBoot from "@/newgame/managers/SceneBoot";

import Boot from "./scenes/boot";
import Overworld from "./scenes/overworld";
import Level from "./scenes/level";
import Battle from "./scenes/battle";

import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin.js";
import AwaitLoaderPlugin from "phaser3-rex-plugins/plugins/awaitloader-plugin.js";

export let game;

export function createInstance (containerId) {
    // game core instance
    game = new Phaser.Game({
        type: Phaser.WEBGL,
        autoStart: false,
        scale: {
            mode: Phaser.Scale.FIT,
            parent: containerId,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: RESOLUTION_SIZES[RESOLUTION_TYPES.HD].width,
            height: RESOLUTION_SIZES[RESOLUTION_TYPES.HD].height
        },
        autoRound: false,
        plugins: {
            global: [
                {
                    key: "rexDrag",
                    plugin: DragPlugin,
                    start: true
                },
                {
                    key: "rexAwaitLoader",
                    plugin: AwaitLoaderPlugin,
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

    // add scenes to game instance
    game.scene.add(SCENE.BOOT, Boot);
    game.scene.add(SCENE.OVERWORLD, Overworld);
    game.scene.add(SCENE.LEVEL, Level);
    game.scene.add(SCENE.BATTLE, Battle);
    return game;
};

export function boot (payload) {
    new SceneBoot(payload);
};