import { COMPONENTS_TYPE, UI_BEHAVIOR_PARAMS } from "@/game/constants/UI";
import { addGenericUIComponent } from "@/game/utils";
import Button from "@/game/uinterfaces/components/generics/Button";
import RuntimeUI from "@/game/uinterfaces/RuntimeUI";

function addGenericComponent (uiContext, masterParentContext, layout) {
    const component = addGenericUIComponent(layout, uiContext.scene);
    uiContext.add(component);
    return component;
};

function addBackground (uiContext, masterParentContext, layout) {
    uiContext.setOriginalBaseSize(addGenericComponent(uiContext, layout));
};

function addButton (uiContext, masterParentContext, layout) {
    const { scene, texts } = uiContext;
    const button = new Button(scene, {
        x: layout.position.x,
        y: layout.position.y,
        spritesheet: layout.spritesheet,
        frames: layout.frames,
        on: {
            click: () => masterParentContext.behaviors[layout.name].bind(masterParentContext)()
        }
        //... behaviorData.textStyle ? { display: texts[id], style: btnLayout.textStyle } : {}
    })
        .setName(layout.name);
    uiContext.add(button);
};

export default { 
    addGenericComponent,
    addBackground,
    addButton
};