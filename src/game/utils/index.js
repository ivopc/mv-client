import Text from "@/game/managers/Text";

import MonsterModel from "@/game/models/Monster";
import MonsterListModel from "@/game/models/MonsterList";

import { convertMsToDate } from "@/lib/utils";

import { TILE } from "@/game/constants/Overworld";
import { RESOLUTION_SIZES } from "@/game/constants/Resolutions";

// convert tile X and Y position to overworld pixel based position
export const positionToOverworld = position => position * TILE.SIZE;

// convert raw monster list to treated monster list model
export const treatMonsterList = monsterList =>
    new MonsterListModel(monsterList.map(monster => new MonsterModel(monster)));

// get resolution dimensions
export const getResolution = type => RESOLUTION_SIZES[type];

// add generic UI component to main UI container
export const addGenericUIComponent = (scene, layout) =>
    scene.add.sprite(
        layout.position.x,
        layout.position.y,
        layout.texture
    )
        .setOrigin(0)
        .setName(layout.name);

// get how many time vip have
export const treatVipDate = function (date) {
    const time = convertMsToDate(date - Date.now());
    if (time.days > 0) {
        return Text.ref.get("profile", "vipDays", {
            time: time.days
        });
    };
    if (time.hours > 0) {
        return Text.ref.get("profile", "vipHours", {
            time: time.hours
        });
    };
    if (time.minutes > 0) {
        return Text.ref.get("profile", "vipMinutes", {
            time: time.minutes
        });
    };
    return Text.ref.get("profile", "vipLessThanOneMin");
};
