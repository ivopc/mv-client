import Text from "@/game/managers/Text";

import MonsterModel from "@/game/models/MonsterModel";
import MonsterListModel from "@/game/models/MonsterListModel";

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
export const addGenericUIComponent = (layout, scene) =>
    scene.add.sprite(
        layout.position.x,
        layout.position.y,
        layout.texture
    )
        .setOrigin(0, 0)
        .setName(layout.name);

export const outOfCameraZoomRange = (val, camera, gameObject) => 
    (camera.zoom - val) * gameObject.width < camera.width || 
    (camera.zoom - val) * gameObject.height < camera.height;

// get how many time vip have
export const treatVipDate = function (date) {
    const { days, hours, minutes } = convertMsToDate(date - Date.now());
    if (days > 0) {
        return Text.ref.get("profile", "vipDays", {
            time: days
        });
    };
    if (hours > 0) {
        return Text.ref.get("profile", "vipHours", {
            time: hours
        });
    };
    if (minutes > 0) {
        return Text.ref.get("profile", "vipMinutes", {
            time: minutes
        });
    };
    return Text.ref.get("profile", "vipLessThanOneMin");
};