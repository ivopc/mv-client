const Button = function (scene, config) {
    this.scene = scene;
    this.sprite;

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

    this.config = config;

    this.addButtSprite();
    this.setListeners();
};

Button.prototype.addButtSprite = function () {
    this.sprite = this.scene.add.sprite(
        this.config.x,
        this.config.y,
        this.config.spritesheet
    )
        .setOrigin(0, 0)
        .setFrame(this.config.frames.out);
};

Button.prototype.setListeners = function () {
    this.sprite.setInteractive({
        useHandCursor: true
    });

    this.sprite.on("pointerdown", this.listeners.click, this);
    this.sprite.on("pointerover", this.listeners.over, this);
    this.sprite.on("pointerup", this.listeners.up, this);
    this.sprite.on("pointerout", this.listeners.out, this);
};

Button.prototype.listeners = {
    click: function () {
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
    }
};

export default Button;