/**
 * All genereal UIs map
 * @enum
 */
export const UIs = [
    { name: "Bag", layout: "bag" },
    { name: "Chat", layout: "chat" },
    { name: "Market", layout: "market" },
    { name: "MarketPlace", layout: "marketPlace" },
    { name: "MonsterBox", layout: "monsterBox" },
    { name: "MonsterStatus", layout: "monsterStatus" },
    { name: "Notification", layout: "notification" },
    { name: "Party", layout: "party" },
    { name: "Quest", layout: "quest" },
    { name: "Profile", layout: "profile" },
    { name: "SelfProfile", layout: "selfProfile" },
    { name: "WildMenu", layout: "wildEncounter" },
    { name: "InitialMonster", layout: "initial" }
];

/**
 * All components types enumerator
 * @enum
 */
export const COMPONENTS_TYPE = {

    MAIN_CONTAINER: "mainContainer",

    STATIC: "STATIC",
    TILE_SPRITE: "TILE_SPRITE",
    SWITCHABLE_SPRITE: "SWITCHABLE_SPRITE",
    BACKGROUND: "BACKGROUND",
    BACKGROUND_TILE_SPRITE: "BACKGROUND_TILE_SPRITE",
    BUTTON: "BUTTON",
    WINDOW_CONTAINER: "WINDOW_CONTAINER",
    WINDOW: "WINDOW",
    TAB: "TAB",
    CONTEXT_MENU: "CONTEXT_MENU",
    TOOLTIP: "TOOLTIP",
    STATIC_DIALOG: "STATIC_DIALOG",
    RAW_DIALOG: "RAW_DIALOG",
    POINTS_BAR: "POINTS_BAR",
    LOADING: "LOADING",
    DRAGGABLE: "DRAGGABLE",
    DRAGGABLE_GRID_CONTAINER: "DRAGGABLE_GRID_CONTAINER",
    DRAGGABLE_GRID_SLOT: "DRAGGABLE_GRID_SLOT",
    DRAGGABLE_GRID_ELEMENT: "DRAGGABLE_GRID_ELEMENT",
    ANIMATED_DIALOG_TEXT: "ANIMATED_DIALOG_TEXT",

    COMPONENTS_GROUP: "COMPONENTS_GROUP",
    BUTTONS_GROUP: "BUTTONS_GROUP",
    SWITCHABLE_SPRITES_GROUP: "SWITCHABLE_SPRITES_GROUP",

    PLACEHOLDER: "PLACEHOLDER"
};

/**
 * Get the component group primitive component type according to many diferents names
 * @param {string} groupName dynamic group name 
 * @returns 
 */
export const getComponentsGroupType = groupName => groupName.split("_")[2]; 


// JSON Script Array Elements Index Structrure

/** Constant to get UI component behavior name `Array`
 * @constant
 */
export const UI_BEHAVIOR_COMPONENT_NAME = 0;

/** Constant to get UI component behavior `Array` params
 * @constant
 */
export const UI_BEHAVIOR_PARAMS = 1;

/**
 * Dynamic enum to get and create the UI states
 * @enum
 */
export const UI_STATES = {
    IDLE: () => "IDLE",
    TAB: id => id ? `TAB_${id}` : "TAB",
    WINDOW: id => id ? `WINDOW_${id}` : "WINDOW"
};

/**
 * `EventEmitter` events namespaces
 * @enum
 */
export const UI_EVENTS = {
    SWITCH_TAB: ({ container, tab }) => `switch-tab|${container}|${tab}`
};

/**
 * Dynamic enum to get and create the UI sub states
 * @enum
 */
export const UI_SUB_STATES = {};

/**
 * Get the state type considering the dynamic name generated y the `UI_STATES` dynamic enum.
 * @param {string} state - current state that is created by the `UI_STATES`
 * @returns {UI_STATES}
 */
export const getUIStateTypeByName = state => Object.values(UI_STATES).find(stateFn => state.startsWith(stateFn()))();