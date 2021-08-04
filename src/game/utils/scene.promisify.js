import PopUp from "phaser3-rex-plugins/plugins/popup";
import FadeOutDestroy from "phaser3-rex-plugins/plugins/fade-out-destroy";
import ScaleDownDestroy from "phaser3-rex-plugins/plugins/scale-down-destroy";
import ShakePosition from "phaser3-rex-plugins/plugins/shakeposition";

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


// >---------> tweens and anims <---------<    

export const popUp = (gameObject, duration) => {
    const popup = PopUp(gameObject, duration);
    return new Promise(resolve => popup.on("complete", resolve));
};

export const fadeoutDestroy = (gameObject, duration) => {
    const fadeout = FadeOutDestroy(gameObject, duration);
    return new Promise(resolve => fadeout.on("complete", resolve));
};

export const scaleDownDestroy = (gameObject, duration) => {
    const scaleDown = ScaleDownDestroy(gameObject, duration);
    return new Promise(resolve => scaleDown.on("complete", resolve));
};

export const shake = (gameObject, config) => {
    const shake = new ShakePosition(gameObject, {
        duration: 500,
        magnetude: 10,
        ... config
    });
    return new Promise(resolve => shake.on("complete", resolve));
};