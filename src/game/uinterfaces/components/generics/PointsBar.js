import Phaser from "phaser";

import { tween } from "@/game/utils/scene.promisify";

class PointsBar extends Phaser.GameObjects.Container {
    constructor (scene, config) {
        super(scene);
        this.uniqueTextureName = Date.now();
        this.barConfig = this.setupConfiguration(config);
        this.drawBackground();
        this.drawPointsBar();
        //this.setFixedToCamera(this.config.isFixedToCamera);
    }

    setupConfiguration (newConfig) {
        // use hexadecimal to decimal: https://www.binaryhexconverter.com/hex-to-decimal-converter
        // #70f8a8 -> 7403688
        this.setPosition(newConfig.x, newConfig.y);
        this.setSize(newConfig.width, newConfig.height);
        return {
            bgColor: newConfig.bgColor,
            barColor: newConfig.barColor,
            width: newConfig.width,
            animationDuration: newConfig.animationDuration || 200,
            isFixedToCamera: newConfig.isFixedToCamera || false
        };
    }

    drawBackground () {
        const bmd = this.scene.add.graphics({
            lineStyle: { alpha: 0 },
            fillStyle: { color: this.barConfig.bgColor, alpha: 1 }
        });
        const rect = {
            x: 0,
            y: 0,
            width: this.displayWidth,
            height: this.displayHeight
        };
        bmd.fillRectShape(rect);
        bmd.fillRect(rect.x, rect.y, rect.width, rect.height);
        bmd.strokeRectShape(rect); 
        bmd.strokeRect(rect.x, rect.y, rect.width, rect.height);
        bmd.generateTexture("background_bar_" + this.uniqueTextureName);
        bmd.destroy();
        this.bgSprite = this.scene.add.sprite(0, 0, "background_bar_" + this.uniqueTextureName).setOrigin(0, 0);
        this.add(this.bgSprite);

    }

    drawPointsBar () {
        const bmd = this.scene.add.graphics({
            lineStyle: { alpha: 0 },
            fillStyle: { color: this.barConfig.barColor, alpha: 1 }
        });
        const rect = {
            x: 0,
            y: 0,
            width: this.displayWidth,
            height: this.displayHeight
        };
        bmd.fillRectShape(rect); 
        bmd.fillRect(rect.x, rect.y, rect.width, rect.height);
        bmd.strokeRectShape(rect); 
        bmd.strokeRect(rect.x, rect.y, rect.width, rect.height);
        bmd.generateTexture("points_bar_" + this.uniqueTextureName);
        bmd.destroy();
        this.barSprite = this.scene.add.sprite(0, 0, "points_bar_" + this.uniqueTextureName).setOrigin(0, 0);
        this.add(this.barSprite);
    }

    addIcon ({ texture, margin: { x, y } }) {
        const icon = this.scene.add.sprite(0, 0, texture).setOrigin(0, 0.5).setName("icon");
        this.add(icon);
        icon.setX(this.bgSprite.x - icon.displayWidth - x);
        icon.y += y;
    }

    addFrame (texture) {
        const frame = this.scene.add.sprite(0, 0, texture).setOrigin(0, 0).setName("frame");
        this.add(frame);
    }

    async setPercent (newValue) {
        if(newValue < 0) 
            newValue = 0;
        if(newValue > 100) 
            newValue = 100;
        const newWidth = (newValue * this.scene.sys.game.canvas.width) / 100;
        await this.setWidth(newWidth);
    }

    async setWidth (newWidth) {
        await tween({
            targets: this.barSprite,
            ease: "Linear",
            duration: this.barConfig.animationDuration,
            displayWidth: newWidth
        }, this.scene);
    }

    setPercentWithoutAnim (newValue) {
        if(newValue < 0) 
            newValue = 0;
        if(newValue > 100) 
            newValue = 100;
        this.barSprite.displayWidth = (newValue * this.scene.sys.game.canvas.width) / 100; // 480 = this.config.width // game.width
    }

    normalizePosition (x, y) {
        this.bgSprite.x = x;
        this.bgSprite.y = y;
        this.barSprite.x = this.bgSprite.x - this.barConfig.width * this.bgSprite.originX;
        this.barSprite.y = y;
    }
};

export default PointsBar;