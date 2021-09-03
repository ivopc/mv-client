import { GameObjects } from "phaser";

class Button extends GameObjects.Container {
    constructor (scene, config) {
        super(scene);
        this.sprite;
        this.text;

        config.x = config.x || 0;
        config.y = config.y || 0;
        config.spritesheet = config.spritesheet || "button";

        const on = config.on || {};
        on.click = on.click || function () {};
        on.over = on.over || function () {};
        on.up = on.up || function () {};
        on.out = on.out || function () {};

        config.frames = config.frames || {};
        config.frames.click = config.frames.click || 0;
        config.frames.over = config.frames.over || 0;
        config.frames.up = config.frames.up || 0;
        config.frames.out = config.frames.out || 0;

        config.text = config.text || {};
        config.text.display = config.text.display || null;
        config.text.style = config.text.style || {};

        this.hasText = !!config.text.display;
        this.config = config;
        this.on = on;

        this.addSprite();
        if (this.hasText)
            this.addText(config.text.display, config.text.style);

        this.setListeners();
        scene.add.existing(this);
    }

    addSprite () {
        this.sprite = this.scene.add.sprite(
            this.config.x,
            this.config.y,
            this.config.spritesheet
        )
            .setOrigin(0, 0)
            .setFrame(this.config.frames.out);
        this.add(this.sprite);
    }

    addText (text, style) {
        const { x, y } = this.sprite.getCenter();
        this.text = this.scene.add.text(x, y, text, style).setOrigin(0.5);
        this.add(this.text);
    }

    setListeners () {
        this.sprite
            .setInteractive({
                useHandCursor: true
            })
            .on("pointerdown", this.listeners.click, this)
            .on("pointerover", this.listeners.over, this)
            .on("pointerup", this.listeners.up, this)
            .on("pointerout", this.listeners.out, this);
    }

    listeners = {
        click: function (pointer) {
            if (!pointer.leftButtonDown()) {
                this.listeners.contextMenu();
                return;
            };
            this.sprite.setFrame(this.config.frames.click);
            this.on.click();
        },
        over: function () {
            this.sprite.setFrame(this.config.frames.over);
            this.on.over();
        },
        up: function () {
            this.sprite.setFrame(this.config.frames.up);
            this.on.up();
        },
        out: function () {
            this.sprite.setFrame(this.config.frames.out);
            this.on.out();
        },
        contextMenu: function () {
            this.sprite.setFrame(this.config.frames.contextMenu);
            this.on.contextMenu();
        }
    }

    setEnabled (enable) {
        this.sprite.input.enabled = enable;
    }
};

export default Button;