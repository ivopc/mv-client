import { COMPONENTS_TYPE, UI_BEHAVIOR_PARAMS } from "@/game/constants/UI";
import { addGenericUIComponent } from "@/game/utils";
import Button from "@/game/uinterfaces/components/generics/Button";


// behavior layout reference {test}
[
    ["BACKGROUND", {id: "background"}],
    ["STATIC", {id: "achieviments"}],
    ["BUTTON", {id: "buttonId"}]
];

function addGenericComponent (uiContext, behaviorData) {
    const component = addGenericUIComponent(behaviorData, uiContext.scene);
    uiContext.add(component);
    return component;
};

function addBackground (uiContext, behaviorData) {
    uiContext.setOriginalBaseSize(addGenericComponent(uiContext, behaviorData));
};

function addButton (uiContext, behaviorData) {
    /*const { scene, texts } = uiContext;
    const text = !behaviorData.textStyle ? { display: texts[id], style: btnLayout.textStyle } : {};
    const button = new Button(scene, {
        x: behaviorData.position.x,
        y: behaviorData.position.y,
        spritesheet: behaviorData.spritesheet,
        frames: behaviorData.frames,
        ... text
    });
    uiContext.add(button);*/
};

export default { 
    addGenericComponent,
    addBackground,
    addButton
};