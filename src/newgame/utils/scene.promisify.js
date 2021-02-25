const timedEvent = async (delay, scene) => 
    new Promise(callback => scene.time.addEvent({ delay, callback }));

export { timedEvent };