const timedEvent = async (delay, scene) => 
    new Promise(callback => scene.time.addEvent({ delay, callback }));

const loadComplete = async scene => 
    new Promise(callback => scene.load.once("complete", callback));

export { timedEvent, loadComplete };