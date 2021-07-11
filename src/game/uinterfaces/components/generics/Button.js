import Phaser from "phaser";

class Button extends Phaser.GameObjects.Container {
    constructor (scene, config) {
        super(scene);
        this.sprite;
        this.text;

        config.x = config.x || 0;
        config.y = config.y || 0;
        config.spritesheet = config.spritesheet || "button";

        config.on = config.on || {};
        config.on.click = config.on.click || function () {};
        config.on.over = config.on.over || function () {};
        config.on.up = config.on.up || function () {};
        config.on.out = config.on.out || function () {};

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
        this.text = this.scene.add.text(0, 0, text, style);
        const btnCenter = this.sprite.getCenter();
        this.text
            .setX(btnCenter.x)
            .setY(btnCenter.y)
            .setOrigin(0.5);
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
            if (!pointer.leftButtonDown())
                return;
            this.sprite.setFrame(this.config.frames.click);
            this.config.on.click();
        },
        over: function () {
            this.sprite.setFrame(this.config.frames.over);
            this.config.on.over();
        },
        up: function () {
            this.sprite.setFrame(this.config.frames.up);
            this.config.on.up();
        },
        out: function () {
            this.sprite.setFrame(this.config.frames.out);
            this.config.on.out();
        },
        contextMenu: function () {
            this.sprite.setFrame(this.config.frames.contextMenu);
            this.config.on.contextMenu();
        }
    }
};

export default Button;