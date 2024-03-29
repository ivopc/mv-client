import { GameObjects } from "phaser";

import LayoutStaticDatabase from "@/game/models/LayoutStaticDatabase";

import Star from "./Star";

const types = [
    ["filled", "void", "void", "void"],
    ["filled", "filled", "void", "void"],    
    ["filled", "filled", "filled", "void"],
    ["filled", "filled", "filled", "filled"]
];

class Rating extends GameObjects.Container {
    constructor (scene, rating) {
        super(scene);
        this.layout = LayoutStaticDatabase.get("wildEncounter");
        // just a reference to know how many stars there's in array,
        // but it is irrelevant to programming
        this.starsList = new Array(4);
        this.appendStars(rating);
        scene.add.existing(this);
    }

    appendStars (rating) {
        this.starsList = this.layout.ratingStars.positions.map((position, index) => {
            const star = new Star(this.scene);
            star.append(types[rating][index], position);
            this.add(star);
            return star;
        });
    }
};

export default Rating;