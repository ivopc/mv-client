import { COMPONENTS_TYPE, UI_BEHAVIOR_PARAMS } from "@/game/constants/UI";
import { addGenericUIComponent } from "@/game/utils";
import Button from "@/game/uinterface/components/generics/Button";


// behavior layout reference {test}
[
    ["BACKGROUND", {id: "background"}],
    ["STATIC", {id: "achieviments"}],
    ["BUTTON", {id: "buttonId"}]
];

export function addGeneric (uiContext, behaviorData) {
    const component = addGenericUIComponent(uiContext.layout[behaviorData[UI_BEHAVIOR_PARAMS].id], uiContext.scene);
    uiContext.add(component);
    return component;
};

export function addBackground (uiContext, behaviorData) {
    uiContext.setOriginalBaseSize(addGeneric(uiContext, behaviorData));
};

export function addButton (uiContext, behaviorData) {
    const { scene, layout, texts } = uiContext;
    const behaviorParams = behaviorData[UI_BEHAVIOR_PARAMS];
    const { id } = behaviorParams;
    const btnLayout = layout[id];
    const text = behaviorParams.hasText ? { display: texts[id], style: btnLayout.textStyle } : {};
    const button = new Button(scene, {
        x: btnLayout.position.x,
        y: btnLayout.position.y,
        spritesheet: btnLayout.spritesheet,
        frames: btnLayout.frames,
        ... text
    });
    uiContext.add(button);
};