import { appendGUIBase } from "../index";
import { currentUI } from "./index";
import { UI_STATES, COMPONENTS_TYPE } from "@/game/constants/UI";
import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";
import Assets from "@/game/managers/Assets";

export let GUI;
let isGUIVisible = false;

export function appendGUI () {
    GUI = appendGUIBase({
        title: "Layout Builder", 
        width: 800, 
        height: 600
    });
    isGUIVisible = true;
    appendUILayoutComponents();
    appendCurrentBrokeLayout();
    mergeNewLayoutButton();
    addDOMEventsListeners();
};

const fetchCurrentLayoutUIComponents = () => 
    Object.values(Assets.ref.getUIComponents())
        .filter(component => component.category === currentUI.layout);

function appendUILayoutComponents () {
    const uiComponents = fetchCurrentLayoutUIComponents();
    const opt = document.createElement("select");
    opt.setAttribute("id", "component-selector");
    const el = document.createElement("p");
    el.style.marginTop = "30px";
    const title = document.createElement("h3");
    const text = document.createTextNode("Escolha o componente");
    title.appendChild(text);
    GUI.appendChild(title);
    GUI.appendChild(el);
    el.appendChild(opt);
    GUI.appendChild(opt);
    uiComponents.forEach(component => 
        opt.add(new Option(component.key, component.key))
    );
};

const fetchBrokeLayout = () =>
    Object.values(LayoutStaticDatabase.get(currentUI.layout)[UI_STATES.IDLE()])
        .filter(component => component.type === COMPONENTS_TYPE.BUTTONS_GROUP)
        .filter(brokeBtnGroup => 
            brokeBtnGroup.list.some(component => component.spritesheet === COMPONENTS_TYPE.PLACEHOLDER)
        );
    
function appendCurrentBrokeLayout () {
    const buttonGroup = fetchBrokeLayout();
    const el = document.createElement("p");
    el.style.marginTop = "30px";
    GUI.appendChild(el);
    const title = document.createElement("h3");
    const text = document.createTextNode("Escolha a parte do layout que ainda está como placeholder");
    title.appendChild(text);
    el.appendChild(title);
    GUI.appendChild(el);
    const opt = document.createElement("select");
    opt.setAttribute("id", "broke-layout-selector");
    buttonGroup.forEach((btn, index) => opt.add(new Option(btn.name, btn.name)));
    GUI.appendChild(opt);
    // deve enviar isso para o server side
    /*
    component name
    spritesheet
    textStyle: {
        fontFamily,
        fontSize,
        color
    }*/
    
};

function mergeNewLayoutButton () {
    const btn = document.createElement("button");
    btn.setAttribute("id", "merge-layout");
    btn.innerText = "Substituir placeholder";
    btn.style.border = "none";
    btn.style.padding = "15px";
    btn.style.fontSize = "1.8em";
    btn.style.borderRadius = "8px";
    const el = document.createElement("p");
    el.style.marginTop = "30px";
    GUI.appendChild(el);
    el.appendChild(btn);
    GUI.append(el);
};

function addDOMEventsListeners () {
    document.addEventListener("keydown", evt => {
        if (evt.key === "Escape") {
            isGUIVisible = !isGUIVisible;
            GUI.style.display = isGUIVisible ? "block" : "none";
        };
    });
    GUI.querySelector("#component-selector").addEventListener("change", evt => console.log(evt.target.value));
    GUI.querySelector("#merge-layout").addEventListener("click", () => console.log("oi"));
};

/*
- listar todos os componentes de UI
- procurar placeholders */