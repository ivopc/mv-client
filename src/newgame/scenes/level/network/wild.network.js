import Network from "@/newgame/managers/Network";

import { LEVEL_EVENTS } from "@/newgame/constants/NetworkEvents";

export async function requestWildEncounter () {
    let response;
    try {
        response = await Network.ref.send(LEVEL_EVENTS.SEARCH_WILD);
    } catch (err) {
        console.error(err);
        return;
    };
    return response;
};