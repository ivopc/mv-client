const timedEvent = (delay, scene) => 
    new Promise(callback => scene.time.addEvent({ delay, callback }));

const loadComplete = scene => 
    new Promise(resolve => scene.load.once("complete", resolve));

export { timedEvent, loadComplete };