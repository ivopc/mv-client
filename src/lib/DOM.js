export async function toggleFullScreen (el) {
    el.requestFullscreen = elem.requestFullscreen || elem.mozRequestFullscreen || elem.msRequestFullscreen || elem.webkitRequestFullscreen;
    if (!document.fullscreenElement) {
        try {
            await elem.requestFullscreen({ navigationUI: "hide" });
        } catch (err) {
            throw err;
        };
    } else {
        document.exitFullscreen();
    };
    return true;
};