import _ from "underscore";

import MonsterStatus from "./monsterstatus";

import Button from "@/game/plugins/button";
import PointsBar from "@/game/plugins/pointsbar";

import RawCharacter from "@/game/gameobjects/rawcharacter";

const Party = function (scene, properties = {}) {
    this.scene = scene;

    // 'party', 'item', 'battleParty', 'battleItem' ou 'defeated'
    this.type = properties.type;
};

 // const party = new Party(this, {type: "party"});
 // party.append();

// Add interface
Party.prototype.append = function (type) {

    if (this.type == "item")
        this.scene.itemActionType = type;

    if (this.type == "defeated") {
        this.text = {};
    };

    // ocultar d-pad e desabilitar click dos botões da interface principal (se estiver
    // no overworld)
    if (this.scene.scene.key == "overworld") {
        this.scene.showHideDPad(false);
        this.scene.enableDisableButtonsInterface(false);
    };
    // background
    this.scene.slotsBg = this.scene.add.sprite(
        0,
        0,
        "party-background"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive()
        .on("pointerdown", () => this.clearPartyTooltip());

    this.scene.containers.interface.add(this.scene.slotsBg);

    // slots e elementos das slots
    this.appendPartySlots();
    this.appendSlotElements();

    // sair da interface
    this.scene.partyBackButton = new Button(this.scene, {
        x: 221,
        y: 198,
        spritesheet: "button_back",
        on: {
            click: () => {

                this.clear(true);

                if (this.scene.scene.key == "overworld") {
                    this.scene.player._data.stop = false;
                    this.scene.enableDisableButtonsInterface(true);
                };

                if (this.scene.scene.key == "battle")
                    this.scene.insertActionMenu();
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });

    this.scene.partyBackButton.sprite.setScrollFactor(0);
    this.scene.containers.interface.add(this.scene.partyBackButton.sprite);

    // caso seja a troca de um monstro derrotado não pode sair dessa interface
    if (this.scene.scene.key == "battle" && this.type == "defeated")
        this.scene.partyBackButton.sprite.destroy();
};

// Limpar interface
Party.prototype.clear = function (destroyBg) {

    this.clearPartyTooltip();
    // checar se quer destruir bg para limpar a interface inteira
    if (destroyBg) {
        this.scene.slotsBg.destroy();
        this.scene.partyBackButton.sprite.destroy();
        if (this.scene.scene.key == "overworld")
            this.scene.showHideDPad(true);
    };

    // limpar slots e todos seus elementos
    for (let i = 0, l = this.scene.slots.length; i < l; i ++) {
        this.scene.slots[i].sprite.destroy();
        _.each(this.scene.slots[i].elements, el => el.destroy());
    };
};

// Add base dos slots
Party.prototype.appendPartySlots = function () {
    this.scene.slots = [];

    this.scene.btn = {};
    this.scene.text = {};

    this.scene.database.interface.party.slots.positions.forEach((position, index) => {

        this.scene.slots[index] = new Button(this.scene, {
            x: position.x,
            y: position.y,
            spritesheet: "party-slot",
            on: {
                click: () => {
                    switch (this.type) {
                        case "item":
                        case "battleParty":
                        case "battleItem":
                        case "defeated":
                        {
                            this.clearPartyTooltip();
                            this.appendPartyTooltip(index);
                            break;
                        };
                    };
                }
            },
            frames: {click: 1, over: 1, up: 1, out: 0}
        });
        this.scene.slots[index].sprite.setScrollFactor(0);
        this.scene.containers.interface.add(this.scene.slots[index].sprite);
    });
};

// Add elementos dos slots (ex: nome, HP, level)
Party.prototype.appendSlotElements = function () {

    const monsters = [];

    for (let i = 0; i < 6; i ++) {
        let monster = this.scene.Data.CurrentMonsters["monster" + (i)];


        this.scene.slots[i].elements = {};

        if (monster) {
            monsters[i] = {
                id: monster.monsterpedia_id,
                name: monster.nickname || this.scene.database.monsters[monster.monsterpedia_id].name,
                level: monster.level,
                hp: {
                    current: monster.current_HP,
                    total: monster.stats_HP
                },
                gender: monster.gender - 1,
                status_problem: monster.status_problem
            };

            this.scene.slots[i].isEmpty = false;
        } else {
            monsters[i] = {
                id: 0,
                name: "-",
                level: "-",
                hp: {
                    current: 0,
                    total: 0
                }
            };

            this.scene.slots[i].isEmpty = true;
            this.scene.slots[i].sprite.input.enabled = false;
        };

        if (monsters[i].hp.current < 0)
            monsters[i].hp.current = 0;

        this.scene.slots[i].elements.name = this.scene.add.text(this.scene.slots[i].sprite.x + 37, this.scene.slots[i].sprite.y + 6, monsters[i].name, {
            fontFamily: "Century Gothic", 
            fontSize: 8.64, 
            color: "#fff" 
        })
            .setScrollFactor(0);

        this.scene.slots[i].elements.level = this.scene.add.text(this.scene.slots[i].sprite.x + 106, this.scene.slots[i].sprite.y + 18, "Lv. " + monsters[i].level, {
            fontFamily: "Century Gothic", 
            fontSize: 8.64, 
            color: "#fff" 
        })
            .setScrollFactor(0);

        this.scene.slots[i].elements.hpText = this.scene.add.text(this.scene.slots[i].sprite.x + 37, this.scene.slots[i].sprite.y + 18, monsters[i].hp.current + "/" + monsters[i].hp.total, {
            fontFamily: "Century Gothic", 
            fontSize: 8.64, 
            color: "#fff" 
        })
            .setScrollFactor(0);

        if (monsters[i].id > 0) {
            this.scene.slots[i].elements.healthBar = new PointsBar(this.scene, {x: this.scene.slots[i].sprite.x + 37, y: this.scene.slots[i].sprite.y + 28, width: 99, height: 7});
            this.scene.slots[i].elements.healthBar.setPercentDirectly((monsters[i].hp.current / monsters[i].hp.total) * 100);
            this.scene.slots[i].elements.healthBar.setFixedToCamera(true);

            this.scene.slots[i].elements.gender = this.scene.add.sprite(
                this.scene.slots[i].elements.name.x + this.scene.slots[i].elements.name.displayWidth + 8,
                this.scene.slots[i].elements.name.y + 5,
                "gender"
            )
                .setFrame(monsters[i].gender)
                .setScrollFactor(0);

            this.scene.slots[i].elements.icon = this.scene.add.existing(
                new RawCharacter(
                    this.scene,
                    this.scene.slots[i].sprite.x + 2,
                    this.scene.slots[i].sprite.y + 3,
                    {
                        sprite: this.scene.database.monsters[monster.monsterpedia_id].name,
                        position: {facing: 2}
                    }
                )
            );

            this.scene.slots[i].elements.icon
                .setInteractive({
                    useHandCursor: true
                })
                .on("pointerdown", () => {
                    this.clearPartyTooltip();
                    this.appendPartyTooltip(i);
                })
                .setScrollFactor(0)
                .changeOrigin(2, this.scene.database.monsters[monster.monsterpedia_id].name);

            if (monsters[i].status_problem > 0) {
                
                this.scene.slots[i].elements.status_problem = this.scene.add.sprite(
                    this.scene.slots[i].elements.gender.x + this.scene.slots[i].elements.gender.displayWidth + 5,
                    this.scene.slots[i].elements.gender.y,
                    "status-problem"
                )
                    .setFrame(this.scene.database.status_problem[monsters[i].status_problem])
                    .setScrollFactor(0);

                this.scene.slots[i].elements.status_problem.scale = 0.25;
            };

            // se for o tipo da interface for party
            if (this.type == "party") {
                // fazer slot arrastável
                this.scene.plugins.get("rexDrag").add(this.scene.slots[i].sprite);
                this.scene.slots[i].sprite.on("dragstart", () => this.clearPartyTooltip());
                this.scene.slots[i].sprite.on("drag", () => this.elementsFollowSlot(this.scene.slots[i]));
                this.scene.slots[i].sprite.on("dragend", () => this.slotOnDragEnd(this.scene.slots[i], i));
            };
        };
    };
};

// Add tooltip
Party.prototype.appendPartyTooltip = function (index) {

    // se for o próprio monstro na hora de trocar por monstro derrotado
    if (this.scene.scene.key == "battle" && this.type == "defeated" && index == 0)
        return;

    this.scene.isPartyTooltipOpened = true;
    this.scene.currentPartyTooltipOpened = index;

    this.scene.tooltip = this.scene.add.sprite(
        this.scene.database.interface.party.tooltips.positions[index].x, 
        this.scene.database.interface.party.tooltips.positions[index].y,
         "party-tooltip"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setFrame(this.treatTooltipFrame(index));

    this.scene.containers.interface.add(this.scene.tooltip);

    // adicionar posição y a mais se for os tooltips de baixo
    let add = 0;
    if (index > 2)
        add = 7;

    switch (this.type) {
        // se for party (no overworld)
        case "party": {
            this.scene.btn.status = new Button(this.scene, {
                x: this.scene.tooltip.x + this.scene.database.interface.party.btntooltips.positions.once.x,
                y: this.scene.tooltip.y + this.scene.database.interface.party.btntooltips.positions.once.y + add,
                spritesheet: "button_new",
                on: {
                    click: () => {
                        this.clear(true);
                        this.scene.interfacesHandler.status = new MonsterStatus(this.scene);
                        this.scene.interfacesHandler.status.append(index);
                    }
                },
                frames: {click: 1, over: 2, up: 0, out: 0}
            });
            this.scene.btn.status.sprite.setScrollFactor(0);
            this.scene.containers.interface.add(this.scene.btn.status.sprite);

            this.scene.text.status = this.scene.add.text(
                0, 
                0, 
                this.scene.cache.json.get("language").party.btninfo[this.scene.lang], 
                {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                }
            )
                .setScrollFactor(0)
                .setOrigin(0.5)
                .setX(this.scene.btn.status.sprite.getCenter().x)
                .setY(this.scene.btn.status.sprite.getCenter().y);
            break;
        };

        // se for item (no overworld)
        case "item": {
            let action = {
                text: null,
                fn: null,
                data: null
            };

            switch (this.scene.itemActionType) {
                // usar
                case 0: {
                    action.text = this.scene.cache.json.get("language").item.use[this.scene.lang];
                    action.fn = this.scene.useItem;
                    action.data = {
                        item: this.scene.selectedItem,
                        monster: this.scene.Data.CurrentMonsters["monster" + index].id
                    };

                    // caso for um pergaminho altera a função
                    if (this.scene.database.items[this.scene.selectedItem].type == "parchment") {
                        action.fn = this.scene.useParchment;
                        action.data._monster = this.scene.Data.CurrentMonsters["monster" + index];
                    };
                    
                    break;
                };
                // equipar
                case 1: {
                    action.text = this.scene.cache.json.get("language").item.equip[this.scene.lang];
                    action.data = {
                        item: this.scene.selectedItem,
                        monster: this.scene.Data.CurrentMonsters["monster" + index].id
                    };
                    break;
                };
            };

            this.scene.btn.action = new Button(this.scene, {
                x: this.scene.tooltip.x + this.scene.database.interface.party.btntooltips.positions.once.x,
                y: this.scene.tooltip.y + this.scene.database.interface.party.btntooltips.positions.once.y + add,
                spritesheet: "button_new",
                on: {
                    click: () => {
                        action.fn.bind(this.scene)(action.data);
                    }
                },
                frames: {click: 1, over: 2, up: 0, out: 0}
            });
            this.scene.btn.action.sprite.setScrollFactor(0);
            this.scene.containers.interface.add(this.scene.btn.action.sprite);

            this.scene.text.action = this.scene.add.text(
                0, 
                0, 
                action.text, 
                {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                }
            )
                .setScrollFactor(0)
                .setOrigin(0.5)
                .setX(this.scene.btn.action.sprite.getCenter().x)
                .setY(this.scene.btn.action.sprite.getCenter().y);

            break;
        };

        // se for party (na batalha)
        case "battleParty": {

            this.scene.btn.trade = new Button(this.scene, {
                x: this.scene.tooltip.x + this.scene.database.interface.party.btntooltips.positions.two[0].x,
                y: this.scene.tooltip.y + this.scene.database.interface.party.btntooltips.positions.two[0].y + add,
                spritesheet: "button_new",
                on: {
                    click: () => {

                        if (index == 0)
                            return console.log("Não vai porra!");

                        console.log("AQUI É QUANDO QUER TROCAR O MONSTRO SEM ELE ESTAR DERROTADO");
                        this.scene.sendSwitchMonster(index);
                    }
                },
                frames: {click: 1, over: 2, up: 0, out: 0}
            });
            this.scene.btn.trade.sprite.setScrollFactor(0);
            this.scene.containers.interface.add(this.scene.btn.trade.sprite);

            this.scene.txt.trade = this.scene.add.text(
                0, 
                0, 
                this.scene.cache.json.get("language").party.btntrade[this.scene.lang], 
                {
                    fontFamily: "Century Gothic", 
                    fontSize: 13, 
                    color: "#fff" 
                }
            )
                .setScrollFactor(0)
                .setOrigin(0.5)
                .setX(this.scene.btn.trade.sprite.getCenter().x)
                .setY(this.scene.btn.trade.sprite.getCenter().y);

            this.scene.btn.status = new Button(this.scene, {
                x: this.scene.tooltip.x + this.scene.database.interface.party.btntooltips.positions.two[1].x,
                y: this.scene.tooltip.y + this.scene.database.interface.party.btntooltips.positions.two[1].y + add,
                spritesheet: "button_new",
                on: {
                    click: () => {
                        this.clear(true);
                        this.scene.interfacesHandler.status = new MonsterStatus(this.scene);
                        this.scene.interfacesHandler.status.append(index);
                    }
                },
                frames: {click: 1, over: 2, up: 0, out: 0}
            });
            this.scene.btn.status.sprite.setScrollFactor(0);
            this.scene.containers.interface.add(this.scene.btn.status.sprite);

            this.scene.txt.status = this.scene.add.text(
                0, 
                0, 
                this.scene.cache.json.get("language").party.btninfo[this.scene.lang], 
                {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                }
            )
                .setScrollFactor(0)
                .setOrigin(0.5)
                .setX(this.scene.btn.status.sprite.getCenter().x)
                .setY(this.scene.btn.status.sprite.getCenter().y);
            break;
        };

        // se for item (na batalha)
        case "battleItem": {
            console.log("USANDO ITEM NA BATALHA");
            this.scene.btn.action = new Button(this.scene, {
                x: this.scene.tooltip.x + this.scene.database.interface.party.btntooltips.positions.once.x,
                y: this.scene.tooltip.y + this.scene.database.interface.party.btntooltips.positions.once.y + add,
                spritesheet: "button_new",
                on: {
                    click: () => {
                        this.scene.useItem({
                            item: this.scene.selectedItem,
                            monster: index
                        });
                    }
                },
                frames: {click: 1, over: 2, up: 0, out: 0}
            });
            this.scene.btn.action.sprite.setScrollFactor(0);
            this.scene.containers.interface.add(this.scene.btn.action.sprite);

            this.scene.text.action = this.scene.add.text(
                0, 
                0, 
                this.scene.cache.json.get("language").item.use[this.scene.lang], 
                {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                }
            )
                .setScrollFactor(0)
                .setOrigin(0.5)
                .setX(this.scene.btn.action.sprite.getCenter().x)
                .setY(this.scene.btn.action.sprite.getCenter().y);
            break;
        };

        // caso seja troca de monstro derrotado
        case "defeated": {
            this.scene.btn.trade = new Button(this.scene, {
                x: this.scene.tooltip.x + this.scene.database.interface.party.btntooltips.positions.two[0].x,
                y: this.scene.tooltip.y + this.scene.database.interface.party.btntooltips.positions.two[0].y + add,
                spritesheet: "button_new",
                on: {
                    click: () => {

                        // AQUI É QUANDO DEVE TROCAR O MONSTRO POIS ELE ESTÁ DERROTADO

                        // se for PvP
                        if (this.scene.battleParams.battleInfo.battle_type == 3) {
                            this.scene.sendSwitchDefeatedMonsterPvP(index);
                        } else {
                            this.scene.sendSwitchMonster(index);
                        };

                        
                        console.log("monster to trade", index);
                    }
                },
                frames: {click: 1, over: 2, up: 0, out: 0}
            });
            this.scene.btn.trade.sprite.setScrollFactor(0);
            this.scene.containers.interface.add(this.scene.btn.trade.sprite);

            this.text.trade = this.scene.add.text(
                0, 
                0, 
                this.scene.cache.json.get("language").party.btntrade[this.scene.lang], 
                {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                }
            )
                .setScrollFactor(0)
                .setOrigin(0.5)
                .setX(this.scene.btn.trade.sprite.getCenter().x)
                .setY(this.scene.btn.trade.sprite.getCenter().y);

            this.scene.btn.status = new Button(this.scene, {
                x: this.scene.tooltip.x + this.scene.database.interface.party.btntooltips.positions.two[1].x,
                y: this.scene.tooltip.y + this.scene.database.interface.party.btntooltips.positions.two[1].y + add,
                spritesheet: "button_new",
                on: {
                    click: () => {
                        this.clear(true);
                        this.scene.interfacesHandler.status = new MonsterStatus(this.scene);
                        this.scene.interfacesHandler.status.append(index);
                        console.log("monster to show infos", index);
                    }
                },
                frames: {click: 1, over: 2, up: 0, out: 0}
            });
            this.scene.btn.status.sprite.setScrollFactor(0);
            this.scene.containers.interface.add(this.scene.btn.status.sprite);

            this.text.status = this.scene.add.text(
                0, 
                0, 
                this.scene.cache.json.get("language").party.btninfo[this.scene.lang], 
                {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                }
            )
                .setScrollFactor(0)
                .setOrigin(0.5)
                .setX(this.scene.btn.status.sprite.getCenter().x)
                .setY(this.scene.btn.status.sprite.getCenter().y);
            break;
        };
    };
};

// Limpar tooltip
Party.prototype.clearPartyTooltip = function () {
    if (this.scene.isPartyTooltipOpened) {
        this.scene.tooltip.destroy();
        switch (this.type) {
            case "party": {
                this.scene.btn.status.sprite.destroy();
                this.scene.text.status.destroy();
                break;
            };
            case "item": {
                this.scene.btn.action.sprite.destroy();
                this.scene.text.action.destroy();
                break;
            };
            case "battleParty": {
                this.scene.btn.trade.sprite.destroy();
                this.scene.txt.trade.destroy();
                this.scene.btn.status.sprite.destroy();
                this.scene.txt.status.destroy();
                break;
            };
            case "battleItem": {
                this.scene.btn.action.sprite.destroy();
                this.scene.text.action.destroy();
                break;
            };
            case "defeated": {
                this.scene.btn.trade.sprite.destroy();
                this.text.trade.destroy();
                this.scene.btn.status.sprite.destroy();
                this.text.status.destroy();
                break;
            };
        };
        this.scene.isPartyTooltipOpened = false;
        this.scene.currentPartyTooltipOpened = -1;
    };
};

// Tratar frame do tooltip
Party.prototype.treatTooltipFrame = function (index) {
    switch (index) {
        case 0:
        case 1:
        {
            return 0;
        };

        case 2: {
            return 1;
        };

        case 3:
        case 4:
        {
            return 2;
        };

        case 5: {
            return 3;
        };
    }
};

// re-set da posição dos elementos, enquanto o slot se mexe fazer os elementos 
// do slot seguir o slot
Party.prototype.elementsFollowSlot = function (slot) {

    slot.elements.name.x = slot.sprite.x + 37;
    slot.elements.name.y = slot.sprite.y + 6;

    slot.elements.level.x = slot.sprite.x + 106;
    slot.elements.level.y = slot.sprite.y + 18;

    slot.elements.hpText.x = slot.sprite.x + 37;
    slot.elements.hpText.y = slot.sprite.y + 18;

    slot.elements.gender.x = slot.elements.name.x + slot.elements.name.displayWidth + 8;
    slot.elements.gender.y = slot.elements.name.y + 5;

    slot.elements.icon.x = slot.sprite.x + 2;
    slot.elements.icon.y = slot.sprite.y + 3;

    slot.elements.healthBar.setPosition(
        slot.sprite.x + 37,
        slot.sprite.y + 28
    );

    // se tiver status problem
    if (slot.elements.status_problem) {
        slot.elements.status_problem.x = slot.elements.gender.x + slot.elements.gender.displayWidth + 5;
        slot.elements.status_problem.y = slot.elements.gender.y;
    };
};

// quando o slot for terminado de ser arrastado
Party.prototype.slotOnDragEnd = function (slot, index) {

    const 
        width = this.scene.database.interface.party.slots.size.width, 
        height = this.scene.database.interface.party.slots.size.height;

    // cacheia posição
    const slotPosition = { ... {
        x: slot.sprite.getCenter().x,
        y: slot.sprite.getCenter().y
    } };

    // itera todas as slots
    for (let i = 0; i < 6; i ++) {

        // se for ele mesmo, vai pro próximo
        if (i == index)
            continue;

        // pegar posição do "mouse" (na vdd o centro da sprite slot)
        if (slotPosition.x >= this.scene.slots[i].sprite.x && slotPosition.x <= this.scene.slots[i].sprite.x + width && 
           slotPosition.y >= this.scene.slots[i].sprite.y && slotPosition.y <= this.scene.slots[i].sprite.y + height) {
            
            // se slot estiver vazia, manda de volta pro local de origem
            if (this.scene.slots[i].isEmpty) {
                slot.sprite.x = this.scene.database.interface.party.slots.positions[index].x;
                slot.sprite.y = this.scene.database.interface.party.slots.positions[index].y;
                this.scene.elementsFollowSlot(slot);
            } else {
                // criando novo objeto dos monstros do jogador
                let new_order = { ... this.scene.Data.CurrentMonsters };

                // trocando monstros de lugar na variável
                this.scene.Data.CurrentMonsters["monster" + index] = new_order["monster" + i];
                this.scene.Data.CurrentMonsters["monster" + i] = new_order["monster" + index];

                // enviar requisição ao servidor de mudança
                this.scene.requestChangePartyPosition(index, i);

                // false = não destruir background
                this.clear(false);

                // redesenha slots
                this.appendPartySlots();
                this.appendSlotElements();
            };
            break;
        } else {
            // se não "colidir" com nenhuma slot: manda de volta pro local de origem
            slot.sprite.x = this.scene.database.interface.party.slots.positions[index].x;
            slot.sprite.y = this.scene.database.interface.party.slots.positions[index].y;
            this.elementsFollowSlot(slot);
        };
    };
};

export default Party;