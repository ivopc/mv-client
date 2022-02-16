import Party from "./party";

import Button from "@/game-old/plugins/button";

const Bag = function (scene) {
    this.scene = scene;
};

// Add interface de bag
Bag.prototype.append = function () {

    if (this.scene.scene.key == "overworld")
        this.scene.enableDisableButtonsInterface(false);
     
    const COLOR_LIGHT = 11587798;
    const COLOR_DARK = 6589876;

    const scrollMode = 0; // 0:vertical, 1:horizontal
    const gridTable = this.scene.rexUI.add.gridTable({
        x: 240,
        y: 120,
        width: 480,
        height: 240,

        scrollMode,

        background: this.scene.add.sprite(0, 0, "items-background"),

        table: {
            cellWidth: (scrollMode === 0) ? undefined : 60,
            cellHeight: (scrollMode === 0) ? 30 : undefined,

            columns: 1,

            mask: {
                padding: 2
            },

            reuseCellContainer: true,
        },

        slider: {
            track: this.scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 2719929),
            thumb: this.scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, 3447003),
        },

        space: {
            left: 20,
            right: 20,
            top: 20,
            bottom: 20,

            table: 10,
            header: 10,
            footer: 10,
        },

        createCellContainerCallback: (cell, cellContainer) => {
            const 
                scene = cell.scene,
                width = cell.width,
                height = cell.height,
                item = cell.item,
                index = cell.index;

            let _sprite;

            switch (item.item_id) {
                case 1: {
                    _sprite = "magic-seal";
                    break;
                };
                case 6: {
                    _sprite = "super-potion";
                    break;
                };
                case 10: {
                    _sprite = "antidote";
                    break;
                };

                case 25: {
                    _sprite = "parchment";
                    break;
                };

                default: {
                    _sprite = "super-potion";
                    break;
                };
            };

            if (cellContainer === null) {
                cellContainer = scene.rexUI.add.label({
                    width: width,
                    height: height,

                    orientation: scrollMode,
                    background: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 0).setStrokeStyle(2, COLOR_LIGHT),
                    icon: scene.add.sprite(0, 0, _sprite),
                    text: scene.add.text(0, 0, ""),

                    space: {
                        icon: 10,
                        left: (scrollMode === 0) ? 15 : 0,
                        top: (scrollMode === 0) ? 0 : 15,
                    }
                });
                //cellContainer._item = item;
                //console.log(cell.index + ": create new cell-container");
            } else {
                //console.log(cell.index + ": reuse cell-container");
            };


            // Set properties from item value
            cellContainer.setMinSize(width, height); // Size might changed in this demo
            const name = this.scene.database.items[item.item_id].name[this.scene.lang];

            cellContainer.getElement("text").setText("x" + item.amount + " " + name); // Set text of text object
            //console.log("oi", cellContainer.getElement("lol"));
            //console.log("icon", cellContainer.getElement("icon"));
            cellContainer.getElement("icon").setTexture(_sprite);
            //cellContainer.getElement("icon").setFillStyle(item.color); // Set fill color of round rectangle object
            return cellContainer;
        },
        items: this.scene.getItems()
    });

    gridTable.layout();

    gridTable.setScrollFactor(0);

    this.scene.isWindowBoxOpenned = false;
 
    gridTable
        .on("cell.over", function (cellContainer, cellIndex) {

            if (this.scene.isWindowBoxOpenned)
                return;

            cellContainer.getElement("background")
                .setStrokeStyle(2, 6589876)
                .setDepth(1);
        }, this)
        .on("cell.out", function (cellContainer, cellIndex) {

            if (this.scene.isWindowBoxOpenned)
                return;

            cellContainer.getElement("background")
                .setStrokeStyle(2, COLOR_LIGHT)
                .setDepth(0);
        }, this)
        .on("cell.click", this.appendItemWindow, this)
        .on("cell.1tap", function (cellContainer, cellIndex) {
        }, this)
        .on("cell.2tap", function (cellContainer, cellIndex) {
        }, this)
        .on("cell.pressstart", function (cellContainer, cellIndex) {
        }, this)
        .on("cell.pressend", function (cellContainer, cellIndex) {
        }, this);

    //gridTable.destroy();

    this.scene.gridTable = gridTable;

    this.scene.itemsClose = new Button(this.scene, {
        x: 462,
        y: 3,
        spritesheet: "profile-close-btn",
        on: {
            click: () => this.clear()
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });

    this.scene.itemsClose.sprite
        .setOrigin(0, 0)
        .setScrollFactor(0);
//

    //this.scene.containers.interface.add(this.scene.itemsClose.sprite);
};

// Limpar interface
Bag.prototype.clear = function () {
    // se window de usar/equipar item estiver aberta limpa ela
    if (this.scene.isWindowBoxOpenned) {

        this.scene.itemWindow.destroy();
        this.scene.itemWindowClose.sprite.destroy();

        if (this.scene.scene.key == "overworld") {
            if (this.scene.itemWindowHasTwoBtn) {
                this.scene.itemWindowUse.sprite.destroy();
                this.scene.itemWindowUseTxt.destroy();
                this.scene.itemWindowEquip.sprite.destroy();
                this.scene.itemWindowEquipTxt.destroy();
            } else {
                this.scene.itemWindowEquip.sprite.destroy();
                this.scene.itemWindowEquipTxt.destroy();
            };
        } else if (this.scene.scene.key == "battle") {
            this.scene.itemWindowUse.sprite.destroy();
            this.scene.itemWindowUseTxt.destroy();
        };

        this.scene.isWindowBoxOpenned = false;
    };
    this.scene.gridTable.destroy();
    this.scene.itemsClose.sprite.destroy();

    if (this.scene.scene.key == "overworld")
        this.scene.enableDisableButtonsInterface(true);
};

// Add janela de escolha de ação do item
Bag.prototype.appendItemWindow = function (cellContainer, cellIndex) {

    // mudando visual do item selecionado
    cellContainer.getElement("background")
        .setStrokeStyle(2, 11587798)
        .setDepth(0);

    if (this.scene.isWindowBoxOpenned)
        return;

    this.scene.isWindowBoxOpenned = true;

    // pegando item selecionado
    const item = this.scene.gridTable.items[cellIndex];

    // se a scene for a batalha verifica se o item tem uso na batalha
    if (this.scene.scene.key == "battle") {

        // se o item não tem uso, sai do método
        if ( !(_.indexOf(this.scene.database.items.battle.use, item.item_id) > -1) ) {
            this.scene.isWindowBoxOpenned = false;
            return;
        };
    };

    let equip, use, equipText, useText;

    const itemWindow = this.scene.add.sprite(168, 43, "items-window-box")
        .setScrollFactor(0)
        .setOrigin(0, 0)
        .setInteractive();

    this.scene.itemWindow = itemWindow;

    const closeBtn = new Button(this.scene, {
        x: 294,
        y: 47,
        spritesheet: "items-close-btn",
        on: {
            click: () => {

                itemWindow.destroy();
                closeBtn.sprite.destroy();

                switch (this.scene.scene.key) {
                    case "overworld": {
                        equip.sprite.destroy();
                        equipText.destroy();
                        if (this.scene.itemWindowHasTwoBtn) {
                            use.sprite.destroy();
                            useText.destroy();
                        };

                        break;
                    };

                    case "battle": {
                        use.sprite.destroy();
                        useText.destroy();

                        break;
                    };
                };

                this.scene.isWindowBoxOpenned = false;
            }
        },
        frames: {click: 0, over: 0, up: 0, out: 0}
    });
    closeBtn.sprite.setScrollFactor(0);

    this.scene.itemWindowClose = closeBtn;

    switch (this.scene.scene.key) {
        case "overworld": {

            const hasTwoBtns = _.indexOf(this.scene.database.items.overworld.use, item.item_id) > -1;
            this.scene.itemWindowHasTwoBtn = hasTwoBtns;

            // pode usar e equipar \\ pode somente equipar
            if (hasTwoBtns) {
                use = new Button(this.scene, {
                    x: this.scene.database.interface.items.btnwindow.two[0].x,
                    y: this.scene.database.interface.items.btnwindow.two[0].y,
                    spritesheet: "items-button",
                    on: {
                        click: () => {
                            this.clear();

                            this.scene.selectedItem = item.item_id;
                            //this.scene.appendPartyItemInterface(0);
                            this.scene.interfacesHandler.party = new Party(this.scene, {type: "item"});
                            this.scene.interfacesHandler.party.append(0);
                        }
                    },
                    frames: {click: 1, over: 2, up: 0, out: 0}
                });

                use.sprite.setScrollFactor(0);

                useText = this.scene.add.text(0, 0, this.scene.cache.json.get("language").item.use[this.scene.lang], { 
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                })
                    .setScrollFactor(0)
                    .setOrigin(0.5)
                    .setX(use.sprite.getCenter().x)
                    .setY(use.sprite.getCenter().y);

                equip = new Button(this.scene, {
                    x: this.scene.database.interface.items.btnwindow.two[1].x,
                    y: this.scene.database.interface.items.btnwindow.two[1].y,
                    spritesheet: "items-button",
                    on: {
                        click: () => {
                            this.clear();

                            this.scene.selectedItem = item.item_id;
                            //this.scene.appendPartyItemInterface(1);
                            this.scene.interfacesHandler.party = new Party(this.scene, {type: "item"});
                            this.scene.interfacesHandler.party.append(1);
                        }
                    },
                    frames: {click: 1, over: 2, up: 0, out: 0}
                });

                equip.sprite.setScrollFactor(0);

                equipText = this.scene.add.text(0, 0, this.scene.cache.json.get("language").item.equip[this.scene.lang], { 
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                })
                    .setScrollFactor(0)
                    .setOrigin(0.5)
                    .setX(equip.sprite.getCenter().x)
                    .setY(equip.sprite.getCenter().y);
            
                this.scene.itemWindowUse = use;
                this.scene.itemWindowUseTxt = useText;
                this.scene.itemWindowEquip = equip;
                this.scene.itemWindowEquipTxt = equipText;
            } else {
                
                equip = new Button(this.scene, {
                    x: this.scene.database.interface.items.btnwindow.once.x,
                    y: this.scene.database.interface.items.btnwindow.once.y,
                    spritesheet: "items-button",
                    on: {
                        click: () => {
                            this.clear();

                            this.scene.selectedItem = item.item_id;
                            //this.scene.appendPartyItemInterface(1);
                            this.scene.interfacesHandler.party = new Party(this.scene, {type: "item"});
                            this.scene.interfacesHandler.party.append(1);
                        }
                    },
                    frames: {click: 1, over: 2, up: 0, out: 0}
                });

                equip.sprite.setScrollFactor(0);

                equipText = this.scene.add.text(0, 0, this.scene.cache.json.get("language").item.equip[this.scene.lang], { 
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                })
                    .setScrollFactor(0)
                    .setOrigin(0.5)
                    .setX(equip.sprite.getCenter().x)
                    .setY(equip.sprite.getCenter().y);

                this.scene.itemWindowEquip = equip;
                this.scene.itemWindowEquipTxt = equipText;
            };

            break;
        };

        case "battle": {
            use = new Button(this.scene, {
                x: this.scene.database.interface.items.btnwindow.once.x,
                y: this.scene.database.interface.items.btnwindow.once.y,
                spritesheet: "items-button",
                on: {
                    click: () => {

                        // limpa interface
                        this.clear();
                        this.scene.clearMenu();

                        // seta item selecionado
                        this.scene.selectedItem = item.item_id;

                        // ver qual item está usando
                        switch (this.scene.database.items[this.scene.selectedItem].type) {
                            case "health_potion": 
                            case "mana_potion":
                            {
                                this.scene.interfacesHandler.party = new Party(this.scene, {type: "battleItem"});
                                this.scene.interfacesHandler.party.append();
                                break;
                            };

                            case "magic_seal": {
                                this.scene.useItem({
                                    item: this.scene.selectedItem
                                });
                                break;
                            };
                        };
                    }
                },
                frames: {click: 1, over: 2, up: 0, out: 0}
            });

            use.sprite.setScrollFactor(0);

            useText = this.scene.add.text(0, 0, this.scene.cache.json.get("language").item.use[this.scene.lang], { 
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            })
                .setScrollFactor(0)
                .setOrigin(0.5)
                .setX(use.sprite.getCenter().x)
                .setY(use.sprite.getCenter().y);

            this.scene.itemWindowUse = use;
            this.scene.itemWindowUseTxt = useText;
            break;
        };
    };
};

export default Bag;