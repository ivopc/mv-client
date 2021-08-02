import { dispatchLayoutNetworkEvents } from "./network";
import { appendGUI } from "./GUI";

import Overworld from "@/game/scenes/overworld";

import { LAYOUT } from "@/game/constants/Loader";

import { loadComplete } from "@/game/utils/scene.promisify";

import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";

import { UIs } from "@/game/constants/UI";
// {todo} escolher qual UI quer editar
export const currentUI = UIs.find(ui => ui.name === "Profile");

export function startLayoutBuilder () {
    appendGUI();
    dispatchLayoutNetworkEvents();
};

export async function reloadUserInterfaceLayout () {
    const scene = Overworld.ref;
    scene.cache.json.remove(LAYOUT);
    scene.load.json(LAYOUT, "assets/resources/layout_hd.json");
    scene.load.start();
    await loadComplete(scene);
    LayoutStaticDatabase.setData(scene.cache.json.get(LAYOUT));
    scene.runtimeUI.destroy();
    scene.addRuntimeUI(currentUI.name);
};