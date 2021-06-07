import Network from "@/newgame/managers/Network";

import { GAME_EVENTS } from "@/newgame/constants/NetworkEvents";

export async function getPing () {
    await Network.ref.send(GAME_EVENTS.PING);
};