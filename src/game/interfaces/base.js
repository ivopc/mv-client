export const InterfaceBase = function (scene, data, config = {}) {
    this.scene = scene;
    this.data = data;

    this.sprite = {};
    this.text = {};
    this.button = {};
    this.helper = {};

    this.visible = true;
    this.exists = true;
};

InterfaceBase.prototype.clear = function () {

    Object.keys(this.sprite).forEach(sprite => this.sprite[sprite].destroy());
    Object.keys(this.text).forEach(text => this.text[text].destroy());
    Object.keys(this.button).forEach(button => this.button[button].sprite.destroy());
    Object.keys(this.helper).forEach(helper => this.helper[helper].destroy());
    
    // delete this.sprite;
    // delete this.text;
    // delete this.button;
    // delete this.helper;

    this.visible = false;
    this.exists = false;
};

InterfaceBase.prototype.setVisibility = function (bool) {
    Object.keys(this.sprite).forEach(sprite => this.sprite[sprite].visible = bool);
    Object.keys(this.text).forEach(text => this.text[text].visible = bool);
    Object.keys(this.button).forEach(button => this.button[button].sprite.visible = bool);
    Object.keys(this.helper).forEach(helper => this.helper[helper].visible = bool);
    this.visible = bool;
};

InterfaceBase.prototype.setScrollFactor = function () {
    
};