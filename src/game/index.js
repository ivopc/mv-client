import { Game, WEBGL, Scale } from "phaser";

import { SCENE } from "@/game/constants/GameScene";
import { RESOLUTION_TYPES, RESOLUTION_SIZES } from "@/game/constants/Resolutions";

import SceneBoot from "@/game/managers/SceneBoot";

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
    game = new Game({
        type: WEBGL,
        autoStart: false,
        scale: {
            mode: Scale.FIT,
            parent: containerId,
            autoCenter: Scale.CENTER_BOTH,
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
    // stop the native full screen method to implement my own
    game.scale.stopListeners();

    if (process.env.NODE_ENV === "development") {
        globalThis.gameInstance = game;
        console.log("loldev");
    };
    return game;
};

export const boot = payload => new SceneBoot(payload);