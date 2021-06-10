const STEP_TIME = {
    STEP: 85,
    RUN: 55,
    RIDE: 40,
    INPUT: 150
};

const TILE = {
    SIZE: 32,
    PROPERTIES: [
        null,
        {
            block: true
        },
        {
            block: false
        },
        {
            door: true
        },
        {
            wild: true
        },
        {
            swim: true
        },
        null,
        {
            event: true
        }
    ],
    TYPES: {
        BLOCK: 0,
        DEFAULT: 1,
        WARP: 3,
        WILD_GRASS: 4,
        EVENT: 7
    }
};

const DIRECTIONS = ["up", "right", "down", "left"];

const DIRECTIONS_HASH = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

const DEFAULT_LEVEL_ZOOM = 2;

export { STEP_TIME, TILE, DIRECTIONS, DIRECTIONS_HASH, DEFAULT_LEVEL_ZOOM };