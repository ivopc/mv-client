export const LEVEL_EVENTS = {
    PONG: "0",
    CHAT_MESSAGE: "1",
    SEARCH_WILD: "20"
};

export const OVERWORLD_ACTIONS = {
    MOVE: 1,
    FACING: 2,
    DESTROY: 3,
    CHANGE_SKIN: 4,
    CHAT_TYPING: 5
};

// just a 'gambiarra' to map which object method 
// we need to use when remote player move or change facing
export const CHARACTER_OVERWORLD_ACTIONS_HASH = {
    [OVERWORLD_ACTIONS.MOVE]: "move",
    [OVERWORLD_ACTIONS.FACING]: "face"
};