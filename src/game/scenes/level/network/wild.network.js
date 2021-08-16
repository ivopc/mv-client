import Network from "@/game/managers/Network";

import { LEVEL_EVENTS } from "@/game/constants/NetworkEvents";

export async function requestWildEncounter () {
    let response;
    try {
        response = await Network.ajax(LEVEL_EVENTS.SEARCH_WILD);
    } catch (err) {
        throw new Error(err);
    };
    return response;
};

export async function acceptBattle () {
    console.log("Aceitou wild!");
};

export async function rejectBattle () {
    console.log("Rejeitou wild!");
};