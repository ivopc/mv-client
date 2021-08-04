export let GUI;

import { startLayoutBuilder } from "@/game/engine/layout-builder";

export function appendGUIBase ( { title, width, height } ) {
    const box = document.createElement("div");
    box.style.width = width + "px";
    box.style.height = height + "px";
    box.style.borderRadius = "25px";
    box.style.backgroundColor = "#16a085";
    box.style.top = "50%";
    box.style.left = "50%";
    box.style.marginLeft = "-" + (width / 2) + "px";
    box.style.marginTop = "-" + (height / 2) + "px";
    box.style.position = "fixed";
    const titleEl = document.createElement("p");
    titleEl.innerText = title;
    titleEl.style.textAlign = "center";
    titleEl.style.fontSize = "2.5em";
    titleEl.style.color = "#341f97";
    box.style.textAlign = "center";
    document.body.appendChild(box);
    box.appendChild(titleEl);
    return box;
}; 

function appendEngineGUI () {
    const box = appendGUIBase({
        title: "Monster Valle Engine", 
        width: 800, 
        height: 600
    });
    [
        {
            display: "Layout Builder",
            click: () => {
                startLayoutBuilder();
            }
        },
        {
            display: "Level Event Editor",
            click: () => {}
        }
    ].map(tool => {
        const el = document.createElement("p");
        const button = document.createElement("button");
        button.style.border = "none";
        button.innerText = tool.display;
        button.addEventListener("click", () => {
            box.style.display = "none";
            tool.click();
        });
        box.appendChild(el);
        el.appendChild(button);
        return button;
    });
    GUI = box;
};

export default function () {
    //appendEngineGUI();
};