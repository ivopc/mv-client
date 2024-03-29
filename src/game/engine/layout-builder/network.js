import Network from "@/game/managers/Network";
import { LAYOUT_BUILDER_EVENTS } from "@/game/constants/NetworkEvents";

import { reloadUserInterfaceLayout } from "./index";

export function dispatchLayoutNetworkEvents () {
    Network.ref.addEvent(LAYOUT_BUILDER_EVENTS.UPDATE_LAYOUT, reloadUserInterfaceLayout);
};

export async function sendBrokeLayoutComponentFix (layoutData) {
    const newLayoutData = await Network.ajax(LAYOUT_BUILDER_EVENTS.SEND_NEW_LAYOUT_DATA, layoutData);
    reloadUserInterfaceLayout();
};