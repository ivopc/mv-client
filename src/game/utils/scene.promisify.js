import { resolve } from "q";
import { isAssetLoaded } from "./lazy-load";

export const timedEvent = (delay, scene) => 
    new Promise(callback => scene.time.addEvent({ delay, callback }));

export const tween = (tweenConfig, scene) =>
    new Promise(resolve => 
        scene.tweens.add({
            ... tweenConfig,
            onComplete: resolve
        })
    );

export const fileLoadCompleted = scene =>
    new Promise(resolve => scene.load.once("load", resolve));


export const loadComplete = scene => 
    new Promise(resolve => scene.load.once("complete", resolve));

