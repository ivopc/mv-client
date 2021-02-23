async function timedEvent(delay, scene) {
    return new Promise(resolve =>
        scene.time.addEvent({
            delay,
            callback: resolve
        })
    );
};

export { timedEvent };