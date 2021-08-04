import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";
import RuntimeUIManager from "@/game/managers/RuntimeUIManager";

import UInterfaceContainer from "./components/generics/UInterfaceContainer";

import { UI_STATES } from "@/game/constants/UI";
import { timedEvent } from "../utils/scene.promisify";

class RuntimeUI extends UInterfaceContainer {
    constructor (scene, layout, state = UI_STATES.IDLE()) {
        super(scene, LayoutStaticDatabase.get(layout));  // {legacy}
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
    toggleWindow (name) {}

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

    get hasWindows () {
        return !!this.layout["WINDOW"];
    }
};

export default RuntimeUI;