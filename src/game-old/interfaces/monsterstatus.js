import Party from "./party";

import Button from "@/game-old/plugins/button";
import PointsBar from "@/game-old/plugins/pointsbar";
import ReplacePhrase from "@/game-old/plugins/replacephrase";

import Monster from "@/game-old/prefabs/monster";

import _ from "underscore";

const TABS = {
    INFO: 1,
    STATISTICS: 2,
    MOVES: 3
};

const MonsterStatus = function (scene) {
    this.scene = scene;
};

// (método principal) Abrir status do monstro especifico
MonsterStatus.prototype.append = function (index) {

    if (this.scene.scene.key == "overworld")
        this.scene.showHideDPad(false);

    this.scene.partyBg = this.scene.add.sprite(
        0,
        0,
        "party-background"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.scene.containers.interface.add(this.scene.partyBg);

    this.scene.partyHud = this.scene.add.sprite(
        300,
        25,
        "party-hud"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.scene.containers.interface.add(this.scene.partyHud);

    this.appendSpecificMonsterButtonsMenu(index);
    this.appendSpecificMonsterMenuBase(index);
    this.appendSpecificMonsterInfoMenu(index);
};

// Limpar Interface
MonsterStatus.prototype.clear = function () {

    this.scene.clearInterface();

    this.scene.partyBg.destroy();
    this.scene.partyCurrentView.destroy();
    this.scene.partyHud.destroy();

    _.each(this.monsterMenu, el => el.destroy());

    this.clearSpecificPartyTabInterface(this.scene.partyCurrentOpenedTab);
};

// appendar base do menu (que vai aparecer em todas as abas)
MonsterStatus.prototype.appendSpecificMonsterMenuBase = function (index) {

    this.monsterMenu = {};

    const 
        monster = this.scene.Data.CurrentMonsters["monster" + index],
        name = this.scene.database.monsters[monster.monsterpedia_id].name;

    this.monsterMenu.name = this.scene.add.text(
        this.scene.database.interface.party.menus.base.name.x, 
        this.scene.database.interface.party.menus.base.name.y, 
        monster.nickname || name, 
        {
            fontFamily: "Helvetica", 
            fontSize: 12.65, 
            color: "#000" 
        }
    )
        .setScrollFactor(0);

    this.monsterMenu.gender = this.scene.add.sprite(
        this.monsterMenu.name.x + this.monsterMenu.name.displayWidth + 8,
        this.monsterMenu.name.y + 8,
        "gender"
    )
        .setFrame(this.scene.Data.CurrentMonsters["monster" + index].gender - 1)
        .setScrollFactor(0);

    this.monsterMenu.level = this.scene.add.text(
        this.scene.database.interface.party.menus.base.level.x, 
        this.scene.database.interface.party.menus.base.level.y, 
        this.scene.Data.CurrentMonsters["monster" + index].level, 
        {
            fontFamily: "Helvetica", 
            fontSize: 12.65, 
            color: "#000" 
        }
    )
        .setScrollFactor(0);

    this.monsterMenu.sprite = this.scene.add.sprite(
        this.scene.partyHud.getCenter().x,
        88,
        "placeholder_monster"
    )
        .setScrollFactor(0)
        .setOrigin(0.5, 0);

    this.monsterMenu.sprite.flipX = true;

    if (monster.status_problem > 0) {
        this.monsterMenu.statusProblem = this.scene.add.sprite(
            this.monsterMenu.gender.x + this.monsterMenu.gender.displayWidth + 12,
            this.monsterMenu.gender.y,
            "status-problem"
        )
            .setFrame(this.scene.database.status_problem[monster.status_problem])
            .setScrollFactor(0);
        this.monsterMenu.statusProblem.scale = 0.5;
    };

    // carregar sprite em assincronia
    this.scene.loadMonsterSprite(
        monster.monsterpedia_id,
        () => this.appendMonsterSpriteMenu(monster.monsterpedia_id)
    );
};

// Trocar pelo placeholder a sprite do monstro carregado
MonsterStatus.prototype.appendMonsterSpriteMenu = function (monsterpedia_id) {

    this.monsterMenu.sprite.destroy();

    this.monsterMenu.sprite = new Monster(this.scene, {monsterpedia_id}, {
        x: this.scene.partyHud.getCenter().x,
        y: 88
    })
        .setOrigin(0.5, 0)
        .setScrollFactor(0);

    this.monsterMenu.sprite.playAnim("idle");

    this.monsterMenu.sprite.flipX = true;

    this.scene.containers.interface.add(this.monsterMenu.sprite);
};

// Appendar botões dos menus
MonsterStatus.prototype.appendSpecificMonsterButtonsMenu = function (index) {

    this.scene.btn.partyBack = new Button(this.scene, {
        x: 436,
        y: 195,
        spritesheet: "button_back",
        on: {
            click: () => {

                this.clear();

                if (this.scene.scene.key == "overworld") {
                    this.scene.appendPartyInterface();
                    return;
                };

                if (this.scene.scene.key == "battle" && this.scene.interfacesHandler.party.type != "defeated") {
                    this.scene.insertPartyMenu();
                } else {
                    this.scene.interfacesHandler.party = new Party(this.scene, {type: "defeated"});
                    this.scene.interfacesHandler.party.append();
                };
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });

    this.scene.btn.partyBack.sprite.setScrollFactor(0);

    this.scene.btn.info = new Button(this.scene, {
        x: this.scene.database.interface.party.menus.base.btninfo.x, 
        y: this.scene.database.interface.party.menus.base.btninfo.y,
        spritesheet: "tab-party-button",
        on: {
            click: () => {
                this.switchSpecificMonsterTab(this.scene.partyCurrentOpenedTab, 1, index);
            }
        },
        frames: {click: 0, over: 0, up: 0, out: 0}
    });

    this.scene.btn.info.sprite.setScrollFactor(0);

    this.scene.btn.statistics = new Button(this.scene, {
        x: this.scene.database.interface.party.menus.base.btnstatistics.x, 
        y: this.scene.database.interface.party.menus.base.btnstatistics.y,
        spritesheet: "tab-party-button",
        on: {
            click: () => {
                this.switchSpecificMonsterTab(this.scene.partyCurrentOpenedTab, 2, index);
            }
        },
        frames: {click: 0, over: 0, up: 0, out: 0}
    });

    this.scene.btn.statistics.sprite.setScrollFactor(0);

    this.scene.btn.moves = new Button(this.scene, {
        x: this.scene.database.interface.party.menus.base.btnmoves.x, 
        y: this.scene.database.interface.party.menus.base.btnmoves.y,
        spritesheet: "tab-party-button",
        on: {
            click: () => {
                this.switchSpecificMonsterTab(this.scene.partyCurrentOpenedTab, 3, index);
            }
        },
        frames: {click: 0, over: 0, up: 0, out: 0}
    });

    this.scene.btn.moves.sprite.setScrollFactor(0);

    this.scene.text.btnInfo = this.scene.add.text(
        0, 
        0, 
        this.scene.cache.json.get("language").party.btninfo[this.scene.lang], 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.btnInfo.setOrigin(0.5);
    this.scene.text.btnInfo.setX(this.scene.btn.info.sprite.getCenter().x);
    this.scene.text.btnInfo.setY(this.scene.btn.info.sprite.getCenter().y);

    this.scene.text.btnStatistics = this.scene.add.text(
        0, 
        0, 
        this.scene.cache.json.get("language").party.btnstatistics[this.scene.lang], 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.btnStatistics.setOrigin(0.5);
    this.scene.text.btnStatistics.setX(this.scene.btn.statistics.sprite.getCenter().x);
    this.scene.text.btnStatistics.setY(this.scene.btn.statistics.sprite.getCenter().y);

    this.scene.text.btnMoves = this.scene.add.text(
        0, 
        0, 
        this.scene.cache.json.get("language").party.btnmoves[this.scene.lang], 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.btnMoves.setOrigin(0.5);
    this.scene.text.btnMoves.setX(this.scene.btn.moves.sprite.getCenter().x);
    this.scene.text.btnMoves.setY(this.scene.btn.moves.sprite.getCenter().y);
};

// {Menu} - Informações
MonsterStatus.prototype.appendSpecificMonsterInfoMenu = function (index) {

    this.scene.partyCurrentOpenedTab = TABS.INFO;

    this.scene.partyCurrentView = this.scene.add.sprite(
        0,
        0,
        "party-info"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.scene.containers.interface.add(this.scene.partyCurrentView);

    const monster = this.scene.Data.CurrentMonsters["monster" + index];

    const exp = this.scene.getExpStatistics(
        monster.experience,
        monster.level
    );

    this.scene.expBar = new PointsBar(this.scene, {
        x: 39, y: 194, 
        width: 212, height: 6, 
        bar: {color: 65535},
        isFixedToCamera: true
    });
    this.scene.expBar.setToContainer(this.scene.containers.interface);
    this.scene.expBar.setPercentDirectly(exp.percentage);

    this.scene.text.toNextLevel = this.scene.add.text(
        this.scene.database.interface.party.menus.status.tonextlevel.x, 
        this.scene.database.interface.party.menus.status.tonextlevel.y, 
        ReplacePhrase(this.scene.cache.json.get("language").party.tonextlevel[this.scene.lang], {exp: exp.total - exp.current}), 
        {
            fontFamily: "Century Gothic", 
            fontSize: 16, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.expText = this.scene.add.text(
        this.scene.database.interface.party.menus.status.exp.x, 
        this.scene.database.interface.party.menus.status.exp.y, 
        "Exp", 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.expStatistics = this.scene.add.text(
        this.scene.database.interface.party.menus.status.expstatistics.x, 
        this.scene.database.interface.party.menus.status.expstatistics.y, 
        (monster.experience) + "/" + (exp.nextTotal), 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.expStatistics.x -= this.scene.text.expStatistics.displayWidth;

    this.scene.text.attrNumber = this.scene.add.text(
        this.scene.database.interface.party.menus.status.pedianumberattr.x, 
        this.scene.database.interface.party.menus.status.pedianumberattr.y, 
        "Nº", 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.attrName = this.scene.add.text(
        this.scene.database.interface.party.menus.status.nameattr.x, 
        this.scene.database.interface.party.menus.status.nameattr.y, 
        this.scene.cache.json.get("language").party.name[this.scene.lang], 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.attrType = this.scene.add.text(
        this.scene.database.interface.party.menus.status.typeattr.x, 
        this.scene.database.interface.party.menus.status.typeattr.y, 
        this.scene.cache.json.get("language").party.type[this.scene.lang], 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000" 
        }
    )
        .setScrollFactor(0);
    //272
    this.scene.text.valNumber = this.scene.add.text(
        this.scene.database.interface.party.menus.status.pedianumberval.x, 
        this.scene.database.interface.party.menus.status.pedianumberval.y, 
        "#" + this.scene.numberToPedia(monster.monsterpedia_id) + " (" + monster.id + ")", 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.valNumber.x -= this.scene.text.valNumber.displayWidth;

    this.scene.text.valName = this.scene.add.text(
        this.scene.database.interface.party.menus.status.nameval.x, 
        this.scene.database.interface.party.menus.status.nameval.y, 
        this.scene.database.monsters[monster.monsterpedia_id].name, 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.valName.x -= this.scene.text.valName.displayWidth;

    this.scene.typeSprites = [];

    const types = this.scene.database.monsters[monster.monsterpedia_id].types;

    if (types.length == 1) {
        this.scene.typeSprites[0] = this.scene.add.sprite(
            272,
            81,
            "types"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setFrame(types[0]);

        this.scene.typeSprites[0].scale = 0.3;
        this.scene.containers.interface.add(this.scene.typeSprites[0]);
        this.scene.typeSprites[0].x -= this.scene.typeSprites[0].displayWidth;
    } else {
        this.scene.typeSprites[0] = this.scene.add.sprite(
            160,
            81,
            "types"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setFrame(types[0]);

        this.scene.typeSprites[0].scale = 0.3;
        this.scene.containers.interface.add(this.scene.typeSprites[0]);

        this.scene.typeSprites[1] = this.scene.add.sprite(
            this.scene.typeSprites[0].x + this.scene.typeSprites[0].displayWidth + 5,
            81,
            "types"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setFrame(types[1]);

        this.scene.typeSprites[1].scale = 0.3;
        this.scene.containers.interface.add(this.scene.typeSprites[1]);
    };
};
// {Menu} - Estatísiticas
MonsterStatus.prototype.appendSpecificMonsterStatisticsMenu = function (index) {

    this.scene.partyCurrentOpenedTab = TABS.STATISTICS;

    const monster = this.scene.Data.CurrentMonsters["monster" + index];

    this.scene.partyCurrentView = this.scene.add.sprite(
        0,
        0,
        "party-stats"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.scene.containers.interface.add(this.scene.partyCurrentView);

    this.scene.text.attrHP = this.scene.add.text(
        this.scene.database.interface.party.menus.statistics.hpattr.x, 
        this.scene.database.interface.party.menus.statistics.hpattr.y, 
        "HP", 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);


    if (monster.current_HP < 0)
        monster.current_HP = 0;

    this.scene.text.valHP = this.scene.add.text(
        this.scene.database.interface.party.menus.statistics.hpval.x,
        this.scene.database.interface.party.menus.statistics.hpval.y,
        //"999/999",
        monster.current_HP + "/" + monster.stats_HP, 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.valHP.x -= this.scene.text.valHP.displayWidth;

    this.scene.text.attrMP = this.scene.add.text(
        this.scene.database.interface.party.menus.statistics.mpattr.x, 
        this.scene.database.interface.party.menus.statistics.mpattr.y, 
        "MP", 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.valMP = this.scene.add.text(
        this.scene.database.interface.party.menus.statistics.mpval.x,
        this.scene.database.interface.party.menus.statistics.mpval.y,
        monster.current_MP + "/" + monster.stats_MP,
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.hpBar = new PointsBar(this.scene, {
        x: 39, y: 54,
        width: 209, height: 4,
        isFixedToCamera: true
    });
    this.scene.hpBar.setToContainer(this.scene.containers.interface);
    this.scene.hpBar.setPercentDirectly((monster.current_HP / monster.stats_HP) * 100);

    this.scene.mpBar = new PointsBar(this.scene, {
        x: 39, y: 83,
        width: 209, height: 4,
        bar: { color: 2730978 },
        isFixedToCamera: true
    });
    this.scene.mpBar.setToContainer(this.scene.containers.interface);
    this.scene.mpBar.setPercentDirectly((monster.current_MP / monster.stats_MP) * 100);

    this.scene.text.attrAtk = this.scene.add.text(
        this.scene.database.interface.party.menus.statistics.atkattr.x,
        this.scene.database.interface.party.menus.statistics.atkattr.y,
        this.scene.cache.json.get("language").party.atk[this.scene.lang],
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.valAtk = this.scene.add.text(
        this.scene.database.interface.party.menus.statistics.atkval.x,
        this.scene.database.interface.party.menus.statistics.atkval.y,
        monster.stats_attack,
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.valAtk.x -= this.scene.text.valAtk.displayWidth;

    this.scene.text.attrDef = this.scene.add.text(
        this.scene.database.interface.party.menus.statistics.defattr.x,
        this.scene.database.interface.party.menus.statistics.defattr.y,
        this.scene.cache.json.get("language").party.def[this.scene.lang],
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.valDef = this.scene.add.text(
        this.scene.database.interface.party.menus.statistics.defval.x,
        this.scene.database.interface.party.menus.statistics.defval.y,
        monster.stats_defense,
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.valDef.x -= this.scene.text.valDef.displayWidth;

    this.scene.text.attrSpe = this.scene.add.text(
        this.scene.database.interface.party.menus.statistics.speattr.x,
        this.scene.database.interface.party.menus.statistics.speattr.y,
        this.scene.cache.json.get("language").party.spe[this.scene.lang],
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.valSpe = this.scene.add.text(
        this.scene.database.interface.party.menus.statistics.speval.x,
        this.scene.database.interface.party.menus.statistics.speval.y,
        monster.stats_speed,
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0);

    this.scene.text.valSpe.x -= this.scene.text.valSpe.displayWidth;


    // se pode ver o SP
    if (monster.canSeeSP) {
        //console.log(monster.sp_HP, monster.sp_attack, monster.sp_defense, monster.sp_speed);

        this.scene.text.valHP.setText(this.scene.text.valHP.text + " (" + monster.sp_HP + ")");
        this.scene.text.valHP.x = this.scene.database.interface.party.menus.statistics.hpval.x;
        this.scene.text.valHP.x -= this.scene.text.valHP.displayWidth;

        this.scene.text.valAtk.setText(this.scene.text.valAtk.text + " (" + monster.sp_attack + ")");
        this.scene.text.valAtk.x = this.scene.database.interface.party.menus.statistics.atkval.x;
        this.scene.text.valAtk.x -= this.scene.text.valAtk.displayWidth;

        this.scene.text.valDef.setText(this.scene.text.valDef.text + " (" + monster.sp_defense + ")");
        this.scene.text.valDef.x = this.scene.database.interface.party.menus.statistics.defval.x;
        this.scene.text.valDef.x -= this.scene.text.valDef.displayWidth;

        this.scene.text.valSpe.setText(this.scene.text.valSpe.text + " (" + monster.sp_speed + ")");
        this.scene.text.valSpe.x = this.scene.database.interface.party.menus.statistics.speval.x;
        this.scene.text.valSpe.x -= this.scene.text.valSpe.displayWidth;
    };
};
// {Menu} - Moves
MonsterStatus.prototype.appendSpecificMonsterMovesMenu = function (index) {

    this.scene.partyCurrentOpenedTab = TABS.MOVES;

    const monster = this.scene.Data.CurrentMonsters["monster" + index];

    this.scene.partyCurrentView = this.scene.add.sprite(
        0,
        0,
        "party-moves"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.scene.containers.interface.add(this.scene.partyCurrentView);

    this.scene.movesBtn = [];
    this.scene.moveNameTxt = [];
    this.scene.moveType = [];

    const moves = [];

    for (let i = 0; i < 4; i ++) {
        moves[i] = monster["move_" + i];
        if (moves[i]) {
            //console.log(this.scene.database.moves[moves[i]].name[this.scene.lang], "|", this.scene.database.moves[moves[i]].desc[this.scene.lang]);
        
            this.scene.movesBtn[i] = this.scene.add.sprite(
                this.scene.database.interface.party.menus.moves.buttons[i].x,
                this.scene.database.interface.party.menus.moves.buttons[i].y,
                "party-move-button"
            )
                .setOrigin(0, 0)
                .setScrollFactor(0)
                .setInteractive({
                    useHandCursor: true
                });

            this.scene.movesBtn[i].on("pointerdown", () => {
                this.clearMoveWindow();
                this.appendMoveWindowInfo(this.scene.database.moves[moves[i]]);
            });

            this.scene.containers.interface.add(this.scene.movesBtn[i]);

            this.scene.moveType[i] = this.scene.add.sprite(
                this.scene.database.interface.party.menus.moves.buttons[i].x + 10,
                this.scene.database.interface.party.menus.moves.buttons[i].y + 8,
                "types"
            )
                .setOrigin(0, 0)
                .setScrollFactor(0)
                .setFrame(this.scene.database.moves[moves[i]].type);

            this.scene.moveType[i].scale = 0.36;
            this.scene.containers.interface.add(this.scene.moveType[i]);

            this.scene.moveNameTxt[i] = this.scene.add.text(0, 0, this.scene.database.moves[moves[i]].name[this.scene.lang], { 
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#000"
            })
                .setOrigin(0, 0)
                .setScrollFactor(0);

            this.scene.moveNameTxt[i]
                .setX(this.scene.movesBtn[i].x + this.scene.movesBtn[i].displayWidth - this.scene.moveNameTxt[i].displayWidth - 3)
                .setY(this.scene.movesBtn[i].y + this.scene.movesBtn[i].displayHeight - this.scene.moveNameTxt[i].displayHeight - 3);

            this.scene.containers.interface.add(this.scene.moveNameTxt[i]);
        };
    };
};

// Add janela com informações do move
MonsterStatus.prototype.appendMoveWindowInfo = function (move) {

    this.scene.isMoveWindowOppened = true;

    this.scene.moveWindow = this.scene.add.sprite(
        76,
        58,
        "party-move-window"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();

    this.scene.containers.interface.add(this.scene.moveWindow);

    this.scene.moveWindowTitle = this.scene.add.text(this.scene.moveWindow.x + 10, this.scene.moveWindow.y + 2, "Descrição", {
        fontFamily: "Century Gothic", 
        fontSize: 19, 
        color: "#000"
    })
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(this.scene.moveWindow.getCenter().x);

    this.scene.moveWindowDesc = this.scene.add.text(this.scene.moveWindow.x + 10, this.scene.moveWindow.y + 22, move.desc[this.scene.lang], {
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#000",
        wordWrap: {
            width: this.scene.moveWindow.displayWidth - 15,
            useAdvancedWrap: true
        }
    })
        .setScrollFactor(0);

    this.scene.containers.interface.add(this.scene.moveWindowDesc);

    this.scene.moveWindowClose = new Button(this.scene, {
        x: 380,
        y: 63,
        spritesheet: "profile-close-btn",
        on: {
            click: () => this.clearMoveWindow()
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });

    this.scene.moveWindowClose.sprite.setScrollFactor(0);
    this.scene.containers.interface.add(this.scene.moveWindowClose.sprite);
};

// Limpar interface da janela das informações do move
MonsterStatus.prototype.clearMoveWindow = function () {
    if (!this.scene.isMoveWindowOppened)
        return;

    this.scene.moveWindow.destroy();
    this.scene.moveWindowTitle.destroy();
    this.scene.moveWindowDesc.destroy();
    this.scene.moveWindowClose.sprite.destroy();

    this.scene.isMoveWindowOppened = false;
};

// Trocar tab de informações
MonsterStatus.prototype.switchSpecificMonsterTab = function (tab, newtab, index) {
    this.scene.clearInterface();
    this.clearSpecificPartyTabInterface(tab);

    this.appendSpecificMonsterButtonsMenu(index);

    switch (newtab) {
        case TABS.INFO: {
            this.appendSpecificMonsterInfoMenu(index);
            break;
        };
        case TABS.STATISTICS: {
            this.appendSpecificMonsterStatisticsMenu(index);
            break;
        };
        case TABS.MOVES: {
            this.appendSpecificMonsterMovesMenu(index);
            break;
        };
    }
};

// Limpar tab especifico
MonsterStatus.prototype.clearSpecificPartyTabInterface = function (currentOpenedTab) {

    this.scene.partyCurrentView.destroy();

    switch (currentOpenedTab) {
        case TABS.INFO: {
            this.scene.expBar.destroy();
            for (let i = 0; i < this.scene.typeSprites.length; i ++)
                this.scene.typeSprites[i].destroy();
            break;
        };

        case TABS.STATISTICS: {
            this.scene.hpBar.destroy();
            this.scene.mpBar.destroy();
            break;
        };

        case TABS.MOVES: {
            this.scene.movesBtn.forEach(btn => btn.destroy());
            this.scene.moveNameTxt.forEach(txt => txt.destroy());
            this.scene.moveType.forEach(sprite => sprite.destroy());

            this.clearMoveWindow();
            break;
        };
    };
};

export default MonsterStatus;