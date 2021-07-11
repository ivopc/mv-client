import * as Phaser from "phaser";

const PointsBar = function (scene, config) {
    this.scene = scene;
    this.container = null;

    this.uniqueTextureName = Date.now();

    this.config = this.setupConfiguration(config);
    this.setPosition(this.config.x, this.config.y);
    this.drawBackground();
    this.drawPointsBar();
    this.setFixedToCamera(this.config.isFixedToCamera);
};

PointsBar.prototype.setupConfiguration = function (newConfig) {

    // use hexadecimal to decimal: https://www.binaryhexconverter.com/hex-to-decimal-converter
    // #70f8a8 -> 7403688

    newConfig.bg = newConfig.bg || {};
    newConfig.bar = newConfig.bar || {};

    return {
        width: newConfig.width || 250,
        height: newConfig.height || 40,
        x: newConfig.x || 0,
        y: newConfig.y || 0,
        bg: {
            color: newConfig.bg.color || 9807270
        },
        bar: {
            color: newConfig.bar.color || 7403688
        },
        animationDuration: newConfig.animationDuration || 200,
        isFixedToCamera: newConfig.isFixedToCamera || false
    };
};

PointsBar.prototype.drawBackground = function() {
    const bmd = this.scene.add.graphics({
        lineStyle: {
            alpha: 0
        },
        fillStyle: {
            color: this.config.bg.color,
            alpha: 1
        }
    });
    const rect = {
        x: 0,
        y: 0,
        width: this.config.width,
        height: this.config.height
    };

    bmd.fillRectShape(rect); // rect: {x, y, width, height}
    bmd.fillRect(rect.x, rect.y, rect.width, rect.height);
    bmd.strokeRectShape(rect);  // rect: {x, y, width, height}
    bmd.strokeRect(rect.x, rect.y, rect.width, rect.height);
    bmd.generateTexture("background_bar_" + this.uniqueTextureName);

    bmd.destroy();

    this.bgSprite = this.scene.add.sprite(this.x, this.y, "background_bar_" + this.uniqueTextureName)
        .setOrigin(0, 0);
};

PointsBar.prototype.drawPointsBar = function() {
    const bmd = this.scene.add.graphics({
        lineStyle: {
            alpha: 0
        },
        fillStyle: {
            color: this.config.bar.color,
            alpha: 1
        }
    });
    const rect = {
        x: 0,
        y: 0,
        width: this.config.width,
        height: this.config.height
    };

    bmd.fillRectShape(rect); // rect: {x, y, width, height}
    bmd.fillRect(rect.x, rect.y, rect.width, rect.height);
    bmd.strokeRectShape(rect);  // rect: {x, y, width, height}
    bmd.strokeRect(rect.x, rect.y, rect.width, rect.height);
    bmd.generateTexture("points_bar_" + this.uniqueTextureName);

    bmd.destroy();

    this.barSprite = this.scene.add.sprite(this.x, this.y, "points_bar_" + this.uniqueTextureName)
        .setOrigin(0, 0);
};

PointsBar.prototype.setPosition = function (x, y) {
    this.x = x;
    this.y = y;

    if(this.bgSprite != null && this.barSprite != null ) {
        this.bgSprite.x = x;
        this.bgSprite.y = y;
        this.barSprite.x = this.bgSprite.x - this.config.width * this.bgSprite.originX;
        this.barSprite.y = y;
    };
};

PointsBar.prototype.setPercent = function (newValue, callback){
    if(newValue < 0) 
        newValue = 0;

    if(newValue > 100) 
        newValue = 100;

    const newWidth = (newValue * this.scene.sys.game.canvas.width) / 100;

    this.setWidth(newWidth, callback);
};

PointsBar.prototype.setWidth = function (newWidth, callback) {

    this.scene.tweens.add({
        targets: this.barSprite,
        ease: "Linear",
        duration: this.config.animationDuration,
        displayWidth: newWidth,
        onComplete: () => {
            if (typeof(callback) === "function")
                callback();
        }
    });
};

PointsBar.prototype.setPercentDirectly = function (newValue) {
    if(newValue < 0) 
        newValue = 0;

    if(newValue > 100) 
        newValue = 100;

    this.barSprite.displayWidth = (newValue * this.scene.sys.game.canvas.width) / 100; // 480 = this.config.width // game.width
};

PointsBar.prototype.setFixedToCamera = function (bool) {
    switch (bool) {
        case true: {
            bool = 0;
            break;
        };

        case false: {
            bool = 1;
            break;
        };
    };

    this.bgSprite.setScrollFactor(bool);
    this.barSprite.setScrollFactor(bool);
};

PointsBar.prototype.setToContainer = function(container) {
    container.add(this.bgSprite);
    container.add(this.barSprite);

    this.container = container;
};

PointsBar.prototype.destroy = function () {
    this.bgSprite.destroy();
    this.barSprite.destroy();
};

export default PointsBar;

class _PointsBar extends Phaser.GameObjects.Container {
    constructor (scene, config) {
        super(scene);
        this.barConfig = this.setupConfiguration(config);
    }

    setupConfiguration () {}

    drawBackground () {}

    drawPointsBar () {}

    setPosition () {}

    async setPercent () {}

    async setWidth () {}

    setPercentWithoutAnim () {}

    setFixedToCamera () {}

    destroy () {}
};