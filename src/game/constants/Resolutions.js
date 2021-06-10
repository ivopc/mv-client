export const RESOLUTION_TYPES = {
    FULL_HD: "fhd",
    HD: "hd",
    MOBILE: "mb"
};

export const RESOLUTION_SIZES = {
    [RESOLUTION_TYPES.FULL_HD]: {
        width: 1920,
        height: 1080
    },
    [RESOLUTION_TYPES.HD]: {
        width: 1280,
        height: 720
    },
    [RESOLUTION_TYPES.MOBILE]: {
        width: 480,
        height: 270
    }
};