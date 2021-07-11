import { UI_BEHAVIOR_COMPONENT_NAME, COMPONENTS_TYPE } from "@/game/constants/UI";

import uiRuntimeBehaviors from "@/game/script-behaviors/ui-behavior.runtime";

class RuntimeUIManager {
    constructor (scene) {
        /**
         * Current `Scene` instance reference
         * @type {Phaser.Scene}
         */
        this.scene = scene;
        /**
         * UI ID
         * @type {string|number}
         */
        this.id;
        /**
         * Contains all the behaviors maped to render and handle UI
         * @type {Array<UIBehavior>}
         */
        this.runtimeIdleBehaviorList = [];
        this.runtimeTabsBehaviorsList = [];
        this.runtimeWindowsBehaviorsList = [];
        this.runtimeVFXBehaviorsList = [];
        this.runtimeSFXBehaviorsList = [];

        /**
         * `RuntimeUI` instance reference to handle the entire UI
         */
        this.UI = new RuntimeUI(scene);
    }

    /**
     * UI ID setter
     * @param {string}
     * @returns {void}
     */
    setUI (id) {
        this.id = id;
    }

    /**
     * Parse the UI JSON template
     * @param JSONData - JSON behavior template to transform to runtime execution
     */
    parse (JSONData) {}

    /**
     * Renderize the UI in the scene runtime
     * @returns {void}
     */
    renderize () {}

    renderizeIdle () {
        this.runtimeIdleBehaviorList.forEach(behavior => {
            const staticAppender = this.behaviorsMap[behavior[UI_BEHAVIOR_COMPONENT_NAME]].bind(this);
            staticAppender(this.UI);
        });
    }

    behaviorsMap = {
        [COMPONENTS_TYPE.STATIC]: function (uiContext) {
            uiRuntimeBehaviors.addStatic(uiContext);
        },
        [COMPONENTS_TYPE.BACKGROUND]: function (uiContext) {
            uiRuntimeBehaviors.addBackground(uiContext);
        },
        [COMPONENTS_TYPE.BUTTON]: function (uiContext) {
            uiRuntimeBehaviors.addButton(uiContext);
        },
    }
};

export default RuntimeUIManager;