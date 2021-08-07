import { addGenericUIComponent } from "@/game/utils";
import Button from "@/game/uinterfaces/components/generics/Button";

function addGenericComponent (uiContext, masterParentContext, layout) {
    const component = addGenericUIComponent(layout, uiContext.scene);
    uiContext.add(component);
    return component;
};

function addBackground (uiContext, masterParentContext, layout) {
    uiContext.setOriginalBaseSize(addGenericComponent(uiContext, masterParentContext, layout));
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

function addTab (uiContext, masterParentContext, layout) {
    const [ firstTab ] = layout.tabs;
    const { scene } = uiContext;
    const tab = addGenericUIComponent({
        position: layout.position,
        texture: firstTab.sprite,
        name: layout.name
    }, scene);
    uiContext.add(tab);
    uiContext.tabsHitbox = layout.tabs.map(({ hitbox: { x, y, width, height } }, index) => 
        scene.add.zone(x, y, width, height)
            .setOrigin(0, 0)
            .setInteractive()
            .on("pointerdown", () => masterParentContext.switchTab(layout, index))
    );
};

export default { 
    addGenericComponent,
    addBackground,
    addButton,
    addTab
};