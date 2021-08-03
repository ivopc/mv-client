import { 
    UI_BEHAVIOR_COMPONENT_NAME, 
    COMPONENTS_TYPE,
    UI_STATES
} from "@/game/constants/UI";

import uiRuntimeBehaviors from "@/game/script-behaviors/ui-behavior.runtime";

class RuntimeUIManager {
    constructor (runtimeUI, layout) {
        /**
         * Current `Scene` instance reference
         * @type {Phaser.Scene}
         */
        this.scene = runtimeUI.scene;
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
        this.runtimeLayoutResponsivityBehavaiorsList = [];
        
        /**
         * Layout data
         * @type {JSON}
         */
        this.layout = layout;

        /**
         * `RuntimeUI` instance reference to handle the entire UI  
         * @type {RuntimeUI}
         */
        this.UI = runtimeUI;
    }

    /**
     * Parse the UI JSON template
     * @param JSONData - JSON behavior template to transform to runtime execution
     */
    parse () {}

    /**
     * Renderize the UI in the scene runtime
     * @returns {void}
     */
    renderize () {}


    /**
     * 
     * @param {JSON} layout - the JSON layout loaded from Phaser
     */
    addIdleBehavior () {
        this.runtimeIdleBehaviorList = Object.values(this.layout[UI_STATES.IDLE()]).map(component => component);;
    }

    renderizeIdle () {
        this.runtimeIdleBehaviorList.forEach(behavior => {
            const idleComponentCreator = this.idleBehaviors[behavior.type || COMPONENTS_TYPE.STATIC].bind(this);
            idleComponentCreator(this.UI, behavior);
        });
    }

    idleBehaviors = {
        [COMPONENTS_TYPE.STATIC]: function (uiContext, behavior) {
            uiRuntimeBehaviors.addGenericComponent(uiContext, behavior);
        },
        [COMPONENTS_TYPE.BACKGROUND]: function (uiContext, behavior) {
            uiRuntimeBehaviors.addBackground(uiContext, behavior);
        },
        [COMPONENTS_TYPE.BUTTONS_GROUP]: function (uiContext, behavior) {
            const newBehaviorList = behavior.list.map((behavior, index, arr) => ({
                ... behavior,
                ... {
                    // we need to get the first array element because it's the base position of all elements above
                    position: {
                        x: index !== 0 ? arr[0].position.x + behavior.position.x : behavior.position.x,
                        y: index !== 0 ? arr[0].position.y + behavior.position.y : behavior.position.y,
                    } 
                }
            }));
            newBehaviorList.forEach(buttonLayout => uiRuntimeBehaviors.addButton(uiContext, buttonLayout));
        },
        [COMPONENTS_TYPE.BUTTON]: function (uiContext, behavior) {
            uiRuntimeBehaviors.addButton(uiContext, behavior);
        },
    }
};

export default RuntimeUIManager;