import Overworld from "./index";

// possivel ações
Overworld.actions = {
    walking: 1,
    dialog: 2
};

Overworld.questAction = {
    1: "defeat",
    2: "tame",
    3: "drop"
};

Overworld.invertedQuestAction = {
    "defeat": 1,
    "tame": 2,
    "drop": 3
};

// mapobject
Overworld.mapObjectPosition = {};

// ação atual
Overworld.currentAction = null;

// objeto que personagem interagiu
Overworld.currentObjectInteracted = null;


Overworld.dialogAnimationLetterTime = 75;

// posição atual do dialogo na lista do array
Overworld.dialogIndex = 0;

// sprite atual do dialogo
Overworld.dialogCurrentSprite = null;

// array contendo o texto
Overworld.dialogCurrentText = null;

// objeto de renderização do texto (da engine)
Overworld.dialogCurrentRenderingText = null;

// callback de quando o dialogo acabar
Overworld.dialogCallback = null;

// flag para definir se troca de dialogo está bloqueada
Overworld.isDialogLocked = true;

// flag para definir se interação está bloqueada
Overworld.isInteractionLocked = false;

export default Overworld;