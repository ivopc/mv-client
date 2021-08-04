import { 
    UI_BEHAVIOR_COMPONENT_NAME, 
    COMPONENTS_TYPE,
    UI_STATES
} from "@/game/constants/UI";

import uiRuntimeBehaviors from "@/game/script-behaviors/ui-behavior.runtime";
import UInterfaceContainer from "@/game/uinterfaces/components/generics/UInterfaceContainer";
import { popUp, fadeoutDestroy } from "@/game/utils/scene.promisify";

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
        this.runtimeWindowsBehaviors = {};
        this.runtimeTabsBehaviorsList = [];
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
        this.runtimeIdleBehaviorList = Object.values(this.layout[UI_STATES.IDLE()]);
    }

    addWindowsBehavior () {
        this.runtimeWindowsBehaviors = this.layout[UI_STATES.WINDOW()];
    }

    renderizeIdle () {
        this.runtimeIdleBehaviorList.forEach(layout => {
            const staticComponentCreator = this.staticBehaviors[layout.type || COMPONENTS_TYPE.STATIC].bind(this);
            staticComponentCreator(
                this.UI, 
                this.UI, 
                layout
            );
        });
        popUp(this.UI, 300);
    }

    async renderizeWindow (name) {
        const window = new UInterfaceContainer(this.scene, this.runtimeWindowsBehaviors[name]);
        window.setName(name);
        this.scene.add.existing(window);
        this.UI.add(window);
        Object.values(this.runtimeWindowsBehaviors[name])
            .filter(component => component.name !== COMPONENTS_TYPE.MAIN_CONTAINER)
            .forEach(layout => {
                const staticComponentCreator = this.staticBehaviors[layout.type || COMPONENTS_TYPE.STATIC].bind(this);
                staticComponentCreator(
                    window, 
                    this.UI, 
                    layout
                );
            });
        await popUp(window, 300);
    }

    staticBehaviors = {
        [COMPONENTS_TYPE.STATIC]: function (uiContext, masterParentContext, layout) {
            uiRuntimeBehaviors.addGenericComponent(uiContext, masterParentContext, layout);
        },
        [COMPONENTS_TYPE.BACKGROUND]: function (uiContext, masterParentContext, layout) {
            uiRuntimeBehaviors.addBackground(uiContext, masterParentContext, layout);
        },
        [COMPONENTS_TYPE.BUTTON]: function (uiContext, masterParentContext, layout) {
            uiRuntimeBehaviors.addButton(uiContext, masterParentContext, layout);
        },
        [COMPONENTS_TYPE.BUTTONS_GROUP]: function (uiContext, masterParentContext, layout) {
            const newBehaviorList = layout.list.map((layout, index, arr) => ({
                ... layout,
                ... {
                    // we need to get the first array element because it's the base position of all elements above
                    position: {
                        x: index !== 0 ? arr[0].position.x + layout.position.x : layout.position.x,
                        y: index !== 0 ? arr[0].position.y + layout.position.y : layout.position.y,
                    } 
                }
            }));
            newBehaviorList.forEach(layout => uiRuntimeBehaviors.addButton(uiContext, masterParentContext, layout));
        }
    }
};

export default RuntimeUIManager;