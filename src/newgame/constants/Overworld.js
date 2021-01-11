const STEP_TIME = {
    STEP: 85,
    RUN: 55,
    RIDE: 40
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
    ]
};

const DIRECTIONS = ["up", "right", "down", "left"];

const DIRECTIONS_HASH = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

export { STEP_TIME, TILE, DIRECTIONS, DIRECTIONS_HASH };