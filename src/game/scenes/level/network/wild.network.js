import Network from "@/game/managers/Network";

import { LEVEL_EVENTS } from "@/game/constants/NetworkEvents";

export async function requestWildEncounter () {
    let response;
    try {
        response = await Network.ref.ajax(LEVEL_EVENTS.SEARCH_WILD);
    } catch (err) {
        console.error(err);
        return;
    };
    return response;
};