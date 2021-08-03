import { COMPONENTS_TYPE, UI_BEHAVIOR_PARAMS } from "@/game/constants/UI";
import { addGenericUIComponent } from "@/game/utils";
import Button from "@/game/uinterfaces/components/generics/Button";

function addGenericComponent (uiContext, behaviorData) {
    const component = addGenericUIComponent(behaviorData, uiContext.scene);
    uiContext.add(component);
    return component;
};

function addBackground (uiContext, behaviorData) {
    uiContext.setOriginalBaseSize(addGenericComponent(uiContext, behaviorData));
};

function addButton (uiContext, behaviorData) {
    const { scene, texts } = uiContext;
    const button = new Button(scene, {
        x: behaviorData.position.x,
        y: behaviorData.position.y,
        spritesheet: behaviorData.spritesheet,
        frames: behaviorData.frames,
        //... behaviorData.textStyle ? { display: texts[id], style: btnLayout.textStyle } : {}
    });
    uiContext.add(button);
};

export default { 
    addGenericComponent,
    addBackground,
    addButton
};