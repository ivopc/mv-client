import Overworld from "./index";

// Libs próprias
import Button from "@/game-old/plugins/button";

Overworld.key = {
    _pressed: {},

    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    W: 87,
    A: 65,
    S: 83,
    D: 68,

    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },

    onKeyDown: function (e) {
        this._pressed[e.keyCode] = true;
    },

    onKeyUp: function (e) {
        delete this._pressed[e.keyCode];
    },

    unbind: function () {
        document.removeEventListener("keyup", this.keyup, false);
        document.removeEventListener("keydown", this.keydown, false);
        this.keyEnter.destroy();
        this.keyZ.destroy();
        this.key1.destroy();
        this.key3.destroy();
        this.key4.destroy();
        this.key5.destroy();
        this.key._pressed = {};
    }
};

Overworld.appendKeyboard = function () {
    const key1 = this.input.keyboard.addKey("one");
    key1.on("down", () => {
        this.toggleParty();
    });

    const key3 = this.input.keyboard.addKey("three");
    key3.on("down", () => {
        this.toggleChat();
    });

    const key4 = this.input.keyboard.addKey("four");
    key4.on("down", () => {
        this.toggleQuests();
    });

    const key5 = this.input.keyboard.addKey("five");
    key5.on("down", () => {
        this.toggleNotifications();
        this.appendNotifications();
    });


    const keyZ = this.input.keyboard.addKey("Z");
    keyZ.on("down", () => {
        this.actionButton();
    });

    this.isChatInputOpenned = false;

    const keyEnter = this.input.keyboard.addKey("Enter");
    //const chatInput = Elements.chat.querySelector("[data-type=chat]");

    // trickzin pra typing funcionar
    //chatInput.style.display = "none";

    keyEnter.on("down", () => {

        if (!this.statusShowingChat)
            return;

        // abrir input de texto caso esteja fechado
        if (chatInput.style.display == "none") {
            this.isChatInputOpenned = true;
            chatInput.style.display = "block";
            chatInput.focus();
            this.sendTypingBalloon(true);
        // fechar input de texto caso não tenha nada digitado
        } else if (chatInput.style.display != "none" && (chatInput.value.length === 0 || !chatInput.value.trim()) ) {

            this.isChatInputOpenned = false;
            chatInput.style.display = "none";
            this.sendTypingBalloon(false);
        // enviar mensagem
        } else if (chatInput.style.display != "none" && chatInput.value.length > 0) {
            this.isChatInputOpenned = true;
            this.sendChatMessage(chatInput.value);
            this.sendTypingBalloon(false);
            chatInput.value = "";
            chatInput.style.display = "none";
            this.isChatInputOpenned = false;
        };
    });

    this.keyEnter = keyEnter;
    this.keyZ = keyZ;
    this.key1 = key1;
    this.key3 = key3;
    this.key4 = key4;
    this.key5 = key5;
};

Overworld.appendDPad = function () {
    
    this.dpad = {};

    this.dpad.up = new Button(this, {
        x: 40,
        y: 136,
        spritesheet: "d-pad",
        on: {
            over: () => {
                this.dpad.up.isDown = true;
            },
            out: () => {
                this.dpad.up.isDown = false;
            }
        },
        frames: {click: "d_up_hover", over: "d_up_hover", up: "d_up", out: "d_up"}
    });
    this.dpad.up.sprite.setScrollFactor(0);
    this.dpad.up.isDown = false;

    this.dpad.right = new Button(this, {
        x: 62,
        y: 164,
        spritesheet: "d-pad",
        on: {
            over: () => {
                this.dpad.right.isDown = true;
            },
            out: () => {
                this.dpad.right.isDown = false;
            }

        },
        frames: {click: "d_right_hover", over: "d_right_hover", up: "d_right", out: "d_right"}
    });
    this.dpad.right.sprite.setScrollFactor(0);
    this.dpad.right.isDown = false;

    this.dpad.down = new Button(this, {
        x: 40,
        y: 185,
        spritesheet: "d-pad",
        on: {
            over: () => {
                this.dpad.down.isDown = true;
            },
            out: () => {
                this.dpad.down.isDown = false;
            }
        },
        frames: {click: "d_down_hover", over: "d_down_hover", up: "d_down", out: "d_down"}
    });
    this.dpad.down.sprite.setScrollFactor(0);
    this.dpad.down.isDown = false;

    this.dpad.left = new Button(this, {
        x: 10,
        y: 166,
        spritesheet: "d-pad",
        on: {
            over: () => {
                this.dpad.left.isDown = true;
            },
            out: () => {
                this.dpad.left.isDown = false;
            }

        },
        frames: {click: "d_left_hover", over: "d_left_hover", up: "d_left", out: "d_left"}
    });
    this.dpad.left.sprite.setScrollFactor(0);
    this.dpad.left.isDown = false;

    this.dpad.button = new Button(this, {
        x: 415,
        y: 174,
        spritesheet: "d-pad",
        on: {
            click: () => this.actionButton()
        },
        frames: {click: "button_press", over: "button_press", up: "button", out: "button"}
    });
    this.dpad.button.sprite.setScrollFactor(0);

    this.containers.interface.add(this.dpad.up.sprite);
    this.containers.interface.add(this.dpad.right.sprite);
    this.containers.interface.add(this.dpad.down.sprite);
    this.containers.interface.add(this.dpad.left.sprite);
    this.containers.interface.add(this.dpad.button.sprite);
};

Overworld.checkKeyboard = function () {
    if (this.isChatInputOpenned)
        return;

    if (this.disableMoveInputs)
        return;

    if (this.key.isDown(this.key.UP) || this.key.isDown(this.key.W))
        this.doMovement(0);
    else if (this.key.isDown(this.key.DOWN) || this.key.isDown(this.key.S))
        this.doMovement(2);

    if (this.key.isDown(this.key.LEFT) || this.key.isDown(this.key.A))
        this.doMovement(3);
    else if (this.key.isDown(this.key.RIGHT) || this.key.isDown(this.key.D)) 
        this.doMovement(1);
};

Overworld.checkDPad = function () {
    if (this.isChatInputOpenned)
        return;

    if (this.disableMoveInputs)
        return;

    // tratando input de movimentação
    if (this.dpad.up.isDown)
        this.doMovement(0);
    else if (this.dpad.down.isDown)
        this.doMovement(2);

    if (this.dpad.left.isDown)
        this.doMovement(3);
    else if (this.dpad.right.isDown)
        this.doMovement(1);
};

// movimento do player -> principal
Overworld.doMovement = function (direction, callback) {
    try {
        this.player.walk(direction, callback);
    } catch (e) {};
};

Overworld.actionButton = function () {

    console.log(this.layer[0].worldToTileXY(this.player.x, this.player.y));

    // caso o botão de interação não esteja habilitado
    if (!this.interactionButtonEnabled)
        return;
       
    switch (this.currentAction) {
        //walking
        case this.actions.walking: {
            this.interactWithObject();
            break;
        };
        // dialog
        case this.actions.dialog: {
            this.nextDialog();
            break;
        };
    };
};

export default Overworld;