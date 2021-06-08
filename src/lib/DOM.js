export async function toggleFullScreen (el) {
    el.requestFullscreen = elem.requestFullscreen || elem.mozRequestFullscreen || elem.msRequestFullscreen || elem.webkitRequestFullscreen;
    if (!document.fullscreenElement) {
        try {
            await elem.requestFullscreen({ navigationUI: "hide" });
        } catch (err) {
            return err;
        };
    } else {
        document.exitFullscreen();
    };
    return true;
};