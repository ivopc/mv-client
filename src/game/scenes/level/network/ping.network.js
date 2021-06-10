import Network from "@/game/managers/Network";

import { GAME_EVENTS } from "@/game/constants/NetworkEvents";

export async function getPing () {
    await Network.ref.ajax(GAME_EVENTS.PING);
};