export const timedEvent = (delay, scene) => 
    new Promise(callback => scene.time.addEvent({ delay, callback }));

export const loadComplete = scene => 
    new Promise(resolve => scene.load.once("complete", resolve));