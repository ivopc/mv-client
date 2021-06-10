import PlayerData from "@/game/managers/PlayerData";

import { MAX_MONSTERS_IN_PARTY } from "@/game/constants/Party";

// the token template that we put in text
const stringTokenTemplate = token => "{" + token + "}";

// we use a function in replacer cause we need to get the value dynamically
export const stringTokens = [
    { key: stringTokenTemplate("PLAYER"), replacer: () => PlayerData.ref.nickname }
];

// add to stringToken all monsters in party dynamically to get them name
for (let i = 0; i < MAX_MONSTERS_IN_PARTY; i ++) {
    stringTokens.push({
        key: stringTokenTemplate("PARTY_MONSTER@" + i),
        replacer: () => {
            const monster = PlayerData.ref.partyMonsters.get(i);
            // just kidding, are this an easter egg to devs?
            return monster ? monster.getName() : "ARE_YOU_A_HACKER?";
        }
    });
};