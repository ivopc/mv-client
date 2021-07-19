import Layout from "@/game/managers/Layout"; // {legacy}
import RuntimeUIManager from "@/game/managers/RuntimeUIManager";

import UInterfaceContainer from "./components/generics/UInterfaceContainer";

import { UI_STATES } from "@/game/constants/UI";

class RuntimeUI extends UInterfaceContainer {
    constructor (scene, layout, state = UI_STATES.IDLE()) {
        super(scene, Layout.ref.get(layout));  // {legacy}
        this.currentState = state;
        this.manager = new RuntimeUIManager(this, Layout.ref.get(layout));
        scene.add.existing(this);
    }

    /**
     * Append the UI in `IDLE` state
     * @abstract
     * @returns {void}
     */
    append () {
        this.manager.renderizeIdle();
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
};

export default RuntimeUI;