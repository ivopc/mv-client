import { GameObjects } from "phaser";
import SwitchableSprite from "../SwitchableSprite";

const types = [
    ["filled", "void", "void", "void"],
    ["filled", "filled", "void", "void"],    
    ["filled", "filled", "filled", "void"],
    ["filled", "filled", "filled", "filled"]
];

class Rating extends GameObjects.Container {
    constructor (scene, layout, spritemapIndex) {
        super(scene);
        this.layout = layout;
        // just a reference to know how many stars there's in array,
        // but it is irrelevant to programming
        this.switchableSpritesList = [ ... Array(layout.amount)];
        this.append(spritemapIndex);
        scene.add.existing(this);
    }

    append (spritemapIndex) {
        this.switchableSpritesList = this.layout.positions.map((position, index) => {
            const switchable = new SwitchableSprite(this.scene);
            switchable.append(this.layout.spritemap[spritemapIndex][index], position);
            this.add(switchable);
            return switchable;
        });
    }
};

export default Rating;