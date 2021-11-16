import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";
import RuntimeUIManager from "@/game/managers/RuntimeUIManager";

import UInterfaceContainer from "./components/generics/UInterfaceContainer";

import { UI_STATES, UI_EVENTS } from "@/game/constants/UI";
import { timedEvent } from "../utils/scene.promisify";

class RuntimeUI extends UInterfaceContainer {
    constructor (scene, layout, state = UI_STATES.IDLE()) {
        super(scene, LayoutStaticDatabase.get(layout));
        this.currentState = state;
        /**
         * @type {RuntimeUIManager}
         */
        this.manager = new RuntimeUIManager(this, this.layout);
        scene.add.existing(this);
    }

    /**
     * Append the UI in `IDLE` state
     * @abstract
     * @returns {void}
     */
    append () {
        this.manager.renderizeIdle();
        this.setOriginalBaseSize(this.getByName("background"));
    }

    /**
     * Open/close the `Window` to current UI by `name` param
     * @param {string} name 
     */
    toggleWindow (componentName, index) {}

    /**
     * When the player change the tab clicking on hitbox.
     * @param {JSON} layout 
     * @param {number} tabIndex 
     */
    switchTab (layout, tabIndex) {
        this.getByName(layout.name).setTexture(layout.tabs[tabIndex].sprite);
        // dispatch to specific UI the event to handle specific tab behavior
        this.emit(UI_EVENTS.SWITCH_TAB({
            container: layout.name,
            tab: layout.tabs[tabIndex].name
        }));
    }

    /**
     * Resize event that is called with window `resize` handled by `LayoutResponsivityManager` class
     * @abstract
     * @param {*} gameSize 
     * @param {*} baseSize 
     * @param {*} displaySize 
     * @param {*} previousWidth 
     * @param {*} previousHeight 
     */
    onResize (gameSize, baseSize, displaySize, previousWidth, previousHeight) {}

    /**
     * `currentState` attribute setter
     * @param {UI_STATES} state 
     */
    setState (state) {
        this.currentState = state;
    }

    /**
     * Getter to knows if there are layout
     */
    get hasWindows () {
        return !!this.layout["WINDOW"];
    }
};

export default RuntimeUI;