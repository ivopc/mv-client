export const BATTLE_TYPES = {
    NONE: 0,
	WILD: 1,
	TAMER: 2,
	PVP: 3
};

export const FIELD_TYPES = {
	GRASS: 1
};

export const FIELD_TYPE_STR = {
	[FIELD_TYPES.GRASS]: "grass"
};

export const HUD_TYPES = {
	PLAYER: 0,
	OPPONENT: 2
};

export const HUD_TYPES_STR = {
	[HUD_TYPES.PLAYER]: "player",
	[HUD_TYPES.OPPONENT]: "opponent"
};

export const BATTLE_MENU_STATES = {
	IDLE: 0,
	FIGHT: 1,
	BAG: 2,
	PARTY: 3
};