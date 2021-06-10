import _ from "underscore";

import Overworld from "./index";

// Sprites Extends
import RawCharacter from "@/game/prefabs/rawcharacter";
import Character from "@/game/prefabs/character";
import Player from "@/game/prefabs/player";
import Loading from "@/game/prefabs/loading";

// Interfaces
import Party from "@/game/interfaces/party";
import Bag from "@/game/interfaces/bag";
import WildMenu from "@/game/interfaces/wildmenu";

// Libs próprias
import Button from "@/game/plugins/button";
import ReplacePhrase from "@/game/plugins/replacephrase";

// converter posição x e y para pixel no "mundo real" do jogo
Overworld.positionToRealWorld = function (position) {
    return position * this.database.overworld.tile.size;
};

// adicionar sprite do jogador
Overworld.addPlayer = function () {

    this.player = this.add.existing(
        new Player(
            this, 
            {
                type: 0,
                nickname: this.player._data.nickname,
                sprite: this.player._data.sprite,
                position: {
                    x: this.player._data.position.x,
                    y: this.player._data.position.y,
                    facing: this.player._data.position.facing
                },
                stepFlag: 0,
                stop: false,
                moveInProgress: false,
                follower: {
                    hash: false,
                    id: -1
                }
            }
        )
    );

    this.containers.main.add(this.player);

    this.player.onStartMove(pos => {
        this.player._data.older = pos;
        //console.log("startou andar", pos);
    });

    this.player.onEndMove(pos => {
        //console.log("parou andar", pos);
    });

    this.player.onCantMove(pos => {
        //console.log("não pode mover", pos);
    });

    this.cameras.main.disableCull = false;

    // camera seguir player
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.cameras.main.startFollow(this.player, true, 1, 1);
};

// appendar personagem (online, npc ou follower) ao mapa
Overworld.appendCharacter = function (object = {}) {

    let data, name;

    let properties = {
        type: object.type,
        sprite: object.char,
        position: {
            x: object.pos.x,
            y: object.pos.y,
            facing: object.dir
        }
    };

    // tratando tipo da sprite
    switch (object.type) {

         // jogador online
        case 1: {
            if (!("uid" in object) || 
                !("char" in object) || 
                !("pos" in object) || 
                !("dir" in object))
                return;

            data = this.online_player_data;
            name = object.uid;
            properties.nickname = object.nickname;
            break;
        };

        // npc
        case 2: { 

            if (!("name" in object) || 
                !("char" in object) || 
                !("pos" in object) || 
                !("dir" in object)
            )
                return;

            data = this.object_data;
            name = object.name;
            properties.visible = object.visible;

            // adiciona a posição do mapa
            this.mapObjectPosition[object.pos.x + "|" + object.pos.y] = name;

            break;
        };

        // follower
        case 3: {
            if (!("name" in object) || 
                !("char" in object) || 
                !("pos" in object) || 
                !("dir" in object)
            )
                return;

            data = this.follower_data;
            name = object.name;

            break;
        };

        // npc treinador/domador 
        case 4: {
            if (!("name" in object) || 
                !("char" in object) || 
                !("pos" in object) || 
                !("dir" in object)
            )
                return;

            data = this.object_data;
            name = object.name;

            properties.isTamer = true;
            properties.maxview = object.maxview;

            // adiciona a posição do mapa
            this.mapObjectPosition[object.pos.x + "|" + object.pos.y] = name;
            break;
        };

        // wild monster
        case 5: {
            if (!("name" in object) || 
                !("char" in object) || 
                !("pos" in object) || 
                !("dir" in object)
            )
                return;
            data = {};
            name = object.name;
            break;
        };
    };

    properties.name = name;

    // adiciona sprite
    data[name] = this.add.existing(
        new Character(
            this,
            properties
        )
    );

    this.containers.main.add(data[name]);

    // interagir com player online
    if (object.type == 1) {
        data[name].displayName(object.nickname);
        data[name].addInteraction((pointer, localX, localY, event) => {
            if (pointer.event.buttons == 1)
                this.appendPlayerProfileInterface(object.uid, object.nickname);
        });
    };

    return data[name];
};

// appendar objetos no mapa (carregamento)
Overworld.appendMapObjects = function () {
    // percorrendo elementos para adiciona-los ao mapa
    _.each(
        this.cache.json.get(this.getCurrentMapName("events")).elements.config, 
        element => this.appendSpecificObject(element)
    );
};

// appendar objeto especifico no mapa (complementar a appendMapObjects)
Overworld.appendSpecificObject = function (element) {

    // pegando flag atual ||| fallback para default
    let currentFlag = element[this.flag] || element["default"];
    console.log({currentFlag});

    // checando se elemento existe, default: true
    currentFlag.exist = "exist" in currentFlag ? currentFlag.exist : true;

    // se não existir, pula
    if (!currentFlag.exist)
        return;

    let object = {};

    switch (element.type) {
        // default npc
        case 2: { 
            object = {
                name: element.name,
                char: currentFlag.sprite || element.default.sprite,
                pos: {
                    x: currentFlag.position.x || element.default.position.x,
                    y: currentFlag.position.y || element.default.position.y
                },
                dir: currentFlag.position.facing || element.default.position.facing,
                type: element.type,
                visible: "visible" in currentFlag ? currentFlag.visible : true
            };

            break;
        };
        // npc domador/treinador
        case 4: {
            object = {
                name: element.name,
                char: currentFlag.sprite || element.default.sprite,
                isTamer: true,
                maxview: element.maxview,
                pos: {
                    x: currentFlag.position.x || element.default.position.x,
                    y: currentFlag.position.y || element.default.position.y
                },
                dir: currentFlag.position.facing || element.default.position.facing,
                type: element.type
            };
            break;
        };
    };

    this.appendCharacter(object);
};

// appendar monstro selvagem ao mapa
Overworld.appendWildMonster = function (sprite) {

    // adiciona sprite do monstro na mesma posição x do jogador e uma posição y a menos
    this.wildMonster = this.appendCharacter({
        name: "wildMonster",
        char: sprite,
        pos: {
            x: this.player._data.position.x,
            y: this.player._data.position.y - 1
        },
        dir: 2,
        type: 5
    });

    // setando alpha
    this.wildMonster.alpha = 0;

    this.containers.main.add(this.wildMonster);

    this.depthSort();

    // efeito fadein
    this.tweens.add({
        targets: this.wildMonster,
        ease: "Linear",
        duration: 600,
        alpha: 1,
        onComplete: () => {
            // vira personagem pra cima || 0 = cima
            this.player.face(0);
        } 
    });
};

Overworld.preWildBattleEffect = function (cb) {

    const 
        cam = this.cameras.main,
        center = this.wildMonster.getCenter();

    cam.pan(
        center.x,
        center.y,
        800,
        "Power2"
    );

    cam.zoomTo(2.5, 800, "Power2", true);

    this.time.addEvent({
        delay: 800, 
        callback: () => cb()
    });
};

// appenda matinho na overlay
Overworld.appendGrassOverlay = function (x, y) {
    const grass_overlay = this.add.sprite(
        this.positionToRealWorld(x),
        this.positionToRealWorld(y),
        "grass_overlay",
        0
    ).setOrigin(0, 0);

    this.containers.preOverlay.add(grass_overlay);

    return grass_overlay;
};

// fazer particulas do matinho
Overworld.appendGrassParticles = function (x, y) {
    const particles = this.add.particles("grass_overlay");

    const 
        emitter = particles.createEmitter({
        frame: 1,
        lifespan: 1000,
        frequency: 100,
        scale: 1.5
    }),
        center = this.database.overworld.tile.size / 2;

    emitter.setPosition(this.positionToRealWorld(x) + center, this.positionToRealWorld(y) + center);
    emitter.setSpeed(50);

    //this.containers.map.add(particles);

    this.time.addEvent({
        delay: 400,
        callback: () => particles.destroy()
    });
};

Overworld.dispatchToasts = function () {
    this.successToast = this.rexUI.add.toast({
        x: 240,
        y: 200,

        background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, 3066993),
        text: this.add.text(0, 0, "", {
            fontSize: "24px",
            fontFamily: "Century Gothic",
            color: "#fff"
        }),
        space: {
            left: 20,
            right: 20,
            top: 20,
            bottom: 20
        }
    });
    this.successToast.setScrollFactor(0);

    this.failToast = this.rexUI.add.toast({
        x: 240,
        y: 200,

        background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, 15158332),
        text: this.add.text(0, 0, "", {
            fontSize: "24px",
            fontFamily: "Century Gothic",
            color: "#fff"
        }),
        space: {
            left: 20,
            right: 20,
            top: 20,
            bottom: 20
        }
    });
    this.failToast.setScrollFactor(0);
};

Overworld.appendIconsMenu = function () {
    this.icon = {};

    this.icon.profile = new Button(this, {
        x: 128,
        y: 5,
        spritesheet: "icons",
        on: {
            click: () => {
                this.Socket.emit("52");
            }
        },
        frames: {click: "icon_profile", over: "icon_profile", up: "icon_profile", out: "icon_profile"}
    });
    this.icon.profile.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.profile.sprite);

    this.icon.party = new Button(this, {
        x: 161,
        y: 5,
        spritesheet: "icons",
        on: {
            click: () => {
                this.toggleParty();
            }
        },
        frames: {click: "icon_party", over: "icon_party", up: "icon_party", out: "icon_party"}
    });
    this.icon.party.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.party.sprite);

    this.icon.bag = new Button(this, {
        x: 188,
        y: 6,
        spritesheet: "icons",
        on: {
            click: () => this.appendBag()
        },
        frames: {click: "icon_bag", over: "icon_bag", up: "icon_bag", out: "icon_bag"}
    });
    this.icon.bag.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.bag.sprite);
    this.icon.chat = new Button(this, {
        x: 218,
        y: 7,
        spritesheet: "icons",
        on: {
            click: () => {
                this.toggleChat();
            }
        },
        frames: {click: "icon_chat", over: "icon_chat", up: "icon_chat", out: "icon_chat"}
    });
    this.icon.chat.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.chat.sprite);
    this.icon.quests = new Button(this, {
        x: 251,
        y: 8,
        spritesheet: "icons",
        on: {
            click: () => {
                this.toggleQuests();
            }
        },
        frames: {click: "icon_quests", over: "icon_quests", up: "icon_quests", out: "icon_quests"}
    });
    this.icon.quests.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.quests.sprite);
    this.icon.notify = new Button(this, {
        x: 278,
        y: 4,
        spritesheet: "icons",
        on: {
            click: () => {
                this.toggleNotifications();
            }
        },
        frames: {click: "icon_notifications", over: "icon_notifications", up: "icon_notifications", out: "icon_notifications"}
    });
    this.icon.notify.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.notify.sprite);

    this.icon.config = new Button(this, {
        x: 308,
        y: 7,
        spritesheet: "icons",
        on: {
            click: () => {
                console.log("click config!");
            }
        },
        frames: {click: "icon_config", over: "icon_config", up: "icon_config", out: "icon_config"}
    });
    this.icon.config.sprite.setScrollFactor(0);
    this.containers.interface.add(this.icon.config.sprite);
    this.icon.fullscreen = {};
    this.icon.fullscreen.sprite = this.add.sprite(
        335, 
        7,
        "icons"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setFrame(this.fullScreenEnabled ? "icon_fullscreen_on" : "icon_fullscreen_off")
        .setInteractive({
            useHandCursor: true
        });

    this.icon.fullscreen.sprite.on("pointerdown", () => {

        this.fullScreenEnabled = !this.fullScreenEnabled;

        toggleFullScreen();

        if (this.fullScreenEnabled) {
            this.icon.fullscreen.sprite.setFrame("icon_fullscreen_on");
        } else {
            this.icon.fullscreen.sprite.setFrame("icon_fullscreen_off");
        };
    });

    this.containers.interface.add(this.icon.fullscreen.sprite);
};

Overworld.appendSelfProfile = function (data) {

    this.selfieBg = this.add.sprite(
        15,
        5,
        "selfprofile-background"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();
    this.containers.interface.add(this.selfieBg);

    this.selfieInfo1 = this.add.sprite(
        22,
        7,
        "selfprofile-info1"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.containers.interface.add(this.selfieInfo1);

    this.selfieInfo2 = this.add.sprite(
        128,
        7,
        "selfprofile-info2"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.containers.interface.add(this.selfieInfo2);

    this.selfieEarns = this.add.sprite(
        240,
        9,
        "selfprofile-earns"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.containers.interface.add(this.selfieEarns);

    this.selfieCharacter = this.add.sprite(
        0,
        20,
        "character_male1_full"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.containers.interface.add(this.selfieCharacter);
    this.selfieCharacter.scale = 0.5;
    this.selfieCharacter
        .setOrigin(0.5, 0)
        .setX(this.selfieInfo1.getCenter().x);

    this.selfieClose = new Button(this, {
        x: 444,
        y: 12,
        spritesheet: "profile-close-btn",
        on: {
            click: () => {
                this.clearSelfProfile();
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });

    this.selfieClose.sprite
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.containers.interface.add(this.selfieClose.sprite);

    this.selfieTxt = {};

    // diferença de position.y += 25

    this.selfieTxt.nickname = this.add.text(
        0, 
        117,
        data.nickname, 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(this.selfieInfo1.getCenter().x);

    this.selfieTxt.level = this.add.text(
        0, 
        142,
        this.database.levelprofile[data.level], 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(this.selfieInfo1.getCenter().x);



    this.selfieTxt.rank = this.add.text(
        0, 
        167,
        this.database.rank[data.rank], 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(this.selfieInfo1.getCenter().x);

    this.selfieTxt.clan = this.add.text(
        0, 
        192,
        this.cache.json.get("language").profile.noclan[this.lang], 
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(this.selfieInfo1.getCenter().x);

    
    this.selfieCoinSilver = this.add.sprite(
        135,
        26,
        "coin-silver"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.containers.interface.add(this.selfieCoinSilver);

    this.selfieTxt.silver = this.add.text(
        0, 
        26,
        data.silver,
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(32 + this.selfieCoinSilver.x + this.selfieCoinSilver.displayWidth);

    this.selfieTxt.silver.y -= 3;

    this.selfieCoinGold = this.add.sprite(
        135,
        57,
        "coin-gold"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.containers.interface.add(this.selfieCoinGold);

    this.selfieTxt.gold = this.add.text(
        0, 
        57,
        data.gold,
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(32 + this.selfieCoinGold.x + this.selfieCoinGold.displayWidth);

    this.selfieTxt.gold.y -= 3;
    this.selfieVipIcon = this.add.sprite(
        135,
        93,
        "vip"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.containers.interface.add(this.selfieVipIcon);

    let vipTxt,
        vipFontSize;

    if (data.vip == 0) {
        vipTxt = this.cache.json.get("language").profile.subscribevip[this.lang];
        vipFontSize = 14;
    } else {
        vipTxt = this.treatVipDate(data.vip_date);
        vipFontSize = 11;
    };

    this.selfieTxt.vip = this.add.text(
        0, 
        93,
        vipTxt,
        {
            fontFamily: "Century Gothic", 
            fontSize: vipFontSize, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(this.selfieInfo2.getCenter().x + 3);

    if (data.vip === 0) {
        
        
        this.selfieTxt.vip
            .setInteractive({useHandCursor: true})
            .on("pointerdown", () => {

                console.log("VAI SE FUDER FDP! CRL POHA FDP DO CRL!");

                this.$eventBus.$emit("navigate-to-other-pages", {
                    name: "PremiumMarket"
                });
            });
    }

    this.selfieSpecialBox = this.add.sprite(136, 158, "selfprofile-special-box")
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.containers.interface.add(this.selfieSpecialBox);

    this.selfieTxt.skin = this.add.text(
        0, 
        164,
        "Trocar Skin",
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(this.selfieSpecialBox.getCenter().x);

    this.selfieSkinBtn = new Button(this, {
        x: 144,
        y: 161,
        spritesheet: "tab-party-button",
        on: {
            click: () => {
                console.log("LOL");
                this.toggleSelfSkinBox();

            }
        },
        frames: {click: 0, over: 0, up: 0, out: 0}
    });
    this.selfieSkinBtn.sprite.setScrollFactor(0);
    this.containers.interface.add(this.selfieSkinBtn.sprite);
    this.selfieSkinBtn.sprite.displayWidth = 80;
    this.selfieSkinBtn.sprite.displayHeight = 20;

    this.selfieTxt.earns = this.add.text(
        0, 
        14,
        this.cache.json.get("language").profile.achievements[this.lang],
        {
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        }
    )
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(this.selfieEarns.getCenter().x);


    //t = this.selfieTxt.earns;
};

Overworld.toggleSelfSkinBox = function () {
    if (!this.selfieSkinBoxOpenned) {
        this.appendSelfSkinBox();
        this.selfieTxt.skin
            .setText("Fechar Box")
            .setOrigin(0.5, 0)
            .setX(this.selfieSpecialBox.getCenter().x);
    } else {
        this.clearSelfProfileSkinBox();
        this.selfieSkinBoxOpenned = false;
        this.selfieTxt.skin
            .setText("Trocar Skin")
            .setOrigin(0.5, 0)
            .setX(this.selfieSpecialBox.getCenter().x);
    };
};

Overworld.appendSelfSkinBox = function () {
    this.selfieSkinBoxOpenned = true;
    this.selfieSkinBoxPage = 0;

    this.selfieSkinBox = this.add.sprite(239, 67, "selfprofile-boxskin")
        .setScrollFactor(0)
        .setOrigin(0, 0);
    this.containers.interface.add(this.selfieSkinBox);

    this.selfieSkinTabPagination = this.add.sprite(278, 40, "selfprofile-skin-tab-pagination")
        .setScrollFactor(0)
        .setOrigin(0, 0);
    this.containers.interface.add(this.selfieSkinTabPagination);

    this.selfieSkinPaginationLeft = new Button(this, {
        x: 323,
        y: 51,
        spritesheet: "market-select-pagination",
        on: {
            click: () => {
                this.selfieSkinBoxPage --;

                this.selfieSkinPaginationRight.sprite.input.enabled = true;

                if (this.selfieSkinBoxPage == 0)
                    this.selfieSkinPaginationLeft.sprite.input.enabled = false;

                this.clearSelfProfileSkinBoxCharacters();

                this.appendSelfSkinsCharacterSprites();
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });

    this.selfieSkinPaginationLeft.sprite
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.containers.interface.add(this.selfieSkinPaginationLeft.sprite);

    this.selfieSkinPaginationLeft.sprite.input.enabled = false;

    this.selfieSkinPaginationRight = new Button(this, {
        x: 353,
        y: 51,
        spritesheet: "market-select-pagination",
        on: {
            click: () => {
                console.log("right");

                this.selfieSkinPaginationLeft.sprite.input.enabled = true;

                this.selfieSkinBoxPage ++;

                if (!this.selfProfileSkinList[this.selfieSkinBoxPage + 1])
                    this.selfieSkinPaginationRight.sprite.input.enabled = false;

                this.clearSelfProfileSkinBoxCharacters();
                this.appendSelfSkinsCharacterSprites();
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });

    this.selfieSkinPaginationRight.sprite
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.selfieSkinPaginationRight.sprite.flipX = true;
    this.containers.interface.add(this.selfieSkinPaginationRight.sprite);

    this.appendSelfSkinsInBox();

    // caso tenha só uma página
    if (this.selfProfileSkinList.length == 1)
        this.selfieSkinPaginationRight.sprite.input.enabled = false;
};

Overworld.appendSelfSkinsInBox = function () {
    this.selfieSkinSlot = [];
    this.selfieSkinView = [];

    for (let i = 0; i < this.database.interface.selfprofile.skinslots.length; i ++) {

        let position = this.database.interface.selfprofile.skinslots[i];

        this.selfieSkinSlot[i] = new Button(this, {
            x: position.x,
            y: position.y,
            spritesheet: "selfprofile-slotskin",
            on: {
                click: () => {
                    console.log("ABC", i);

                }
            },
            frames: {click: 2, over: 1, up: 1, out: 0}
        });
        this.selfieSkinSlot[i].sprite.setScrollFactor(0);
        this.containers.interface.add(this.selfieSkinSlot[i].sprite);
    };

    this.appendSelfSkinsCharacterSprites();
};

Overworld.appendSelfSkinsCharacterSprites = function () {
    const skin_list = _.chunk(this.generateSkinsList(), 12);

    this.selfProfileSkinList = skin_list;

    for (let i = 0; i < skin_list[this.selfieSkinBoxPage].length; i ++) {

        let sprite = this.database.skins[skin_list[this.selfieSkinBoxPage][i]].character_id;

        this.selfieSkinView[i] = new RawCharacter(this, 0, 0, {
            sprite,
            facing: 2
        })
            .setOrigin(0.5)
            .setX(this.selfieSkinSlot[i].sprite.getCenter().x)
            .setY(this.selfieSkinSlot[i].sprite.getCenter().y);

        this.selfieSkinSlot[i].config.on.click = () => {
            this.Socket.emit("51", {
                sprite
            });
            this.player.changeSprite(sprite);
            this.clearSelfProfile();
        };


        this.add.existing(this.selfieSkinView[i]);
        this.containers.interface.add(this.selfieSkinView[i]);
    };
};

Overworld.generateSkinsList = function () {

    //return ["default", 16, "default", 16, "default", 16, "default", 16, "default", 16, "default", 16, 16, 16, 16];

    const list = [];

    list.push("default");

    for (let i = 0; i < this.Data.CurrentItems.length; i ++) {
        let item = this.Data.CurrentItems[i];

        if (item.item_id in this.database.skins)
            list.push(item.item_id);
    };

    return list;
};

Overworld.clearSelfProfile = function () {

    if (this.selfieSkinBoxOpenned)
        this.clearSelfProfileSkinBox();
    this.selfieBg.destroy();
    this.selfieInfo1.destroy();
    this.selfieInfo2.destroy();
    this.selfieEarns.destroy();
    this.selfieCharacter.destroy();
    this.selfieClose.sprite.destroy();
    this.selfieCoinSilver.destroy();
    this.selfieCoinGold.destroy();
    this.selfieVipIcon.destroy();
    this.selfieSpecialBox.destroy();
    //this.selfieSkinBtn.sprite.destroy();
    _.each(this.selfieTxt, el => el.destroy());
};

Overworld.clearSelfProfileSkinBoxCharacters = function () {
    for (let i = 0; i < this.selfieSkinView.length; i ++)
        this.selfieSkinView[i].destroy();
};

Overworld.clearSelfProfileSkinBox = function () {
    this.selfieSkinBox.destroy();
    this.selfieSkinTabPagination.destroy();
    for (let i = 0; i < this.database.interface.selfprofile.skinslots.length; i ++)
        this.selfieSkinSlot[i].sprite.destroy();
    this.clearSelfProfileSkinBoxCharacters();
    this.selfieSkinPaginationLeft.sprite.destroy();
    this.selfieSkinPaginationRight.sprite.destroy();

    this.selfieSkinBoxOpenned = false;
}; 

Overworld.appendQuests = function (id) {

    this.questBase = this.add.sprite(0, 0, "quest-base")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();

    this.questCloseBtn = new Button(this, {
        x: 465,
        y: 4,
        spritesheet: "profile-close-btn",
        on: {
            click: () => {
                this.clearQuestsInterface();
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });

    this.questCloseBtn.sprite.setScrollFactor(0);
    //this.containers.interface.add(this.questCloseBtn.sprite);

    this.questCurrentPage = 1;

    this.questDiv = [];
    this.questTitleTxt = [];

    this.requestQuestsList(this.questCurrentPage, data => this.appendQuestList(data));

    this.questPaginationLeft = new Button(this, {
        x: 34,
        y: 218,
        spritesheet: "quest-pagination-btn",
        on: {
            click: () => {
                if (this.questCurrentPage == 1)
                    return console.log("TCHAU");

                console.log("<<<<");

                if (this.questContainer)
                    this.questContainer.destroy();
                this.questChangePage(--this.questCurrentPage);
            }
        },
        frames: {click: 2, over: 1, up: 1, out: 0}
    });
    this.questPaginationLeft.sprite.setScrollFactor(0);

    this.questPaginationRight = new Button(this, {
        x: 63,
        y: 218,
        spritesheet: "quest-pagination-btn",
        on: {
            click: () => {
                console.log(">>>>>");

                if (this.questContainer)
                    this.questContainer.destroy();
                this.questChangePage(++this.questCurrentPage);
            }
        },
        frames: {click: 2, over: 1, up: 1, out: 0}
    });
    this.questPaginationRight.sprite.setScrollFactor(0);
    this.questPaginationRight.sprite.flipX = true;
};

Overworld.appendQuestList = function (data) {

    // data = [
    //     {id: 2, uid: 1, quest_id: 1, completed: 0},
    //     {id: 2, uid: 1, quest_id: 1, completed: 0},
    //     {id: 2, uid: 1, quest_id: 1, completed: 0},
    //     {id: 2, uid: 1, quest_id: 1, completed: 0},
    //     {id: 2, uid: 1, quest_id: 1, completed: 0},
    //     {id: 2, uid: 1, quest_id: 1, completed: 0}
    // ];

    for (let i = 0; i < data.length; i ++) {
        let quest = data[i];

        this.questDiv[i] = this.add.sprite(this.database.interface.quest.divs[i].x, this.database.interface.quest.divs[i].y, "quest-div")
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.questTitleTxt[i] = this.add.text(0, 0, this.database.quests[quest.quest_id].name[this.lang], { 
            fontFamily: "Century Gothic", 
            fontSize: 10,
            color: "#fff" 
        })
            .setScrollFactor(0)
            .setOrigin(0.5)
            .setX(this.questDiv[i].getCenter().x)
            .setY(this.questDiv[i].y - 15)
            .setWordWrapWidth(100)
            .setInteractive({
                useHandCursor: true
            });

        this.questTitleTxt[i].on("pointerdown", () => {
            this.clearSpecificQuest();
            this.requestSpecificQuestData(quest.quest_id, this.appendSpecificQuest);
        });

        if (i == 0)
            this.requestSpecificQuestData(quest.quest_id, this.appendSpecificQuest);
    };
};

Overworld.appendSpecificQuest = function (txt) {

    this.hasSpecificQuestInterface = true;

    this.questContainer = this.add.container();

    this.requisitsTitleTxt = this.add.text(117, 164, this.cache.json.get("language").quest["requisits"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 14,
        color: "#fff" 
    })
        .setScrollFactor(0);


    this.requisitsTxt = this.add.text(117, 180, txt, { 
        fontFamily: "Century Gothic", 
        fontSize: 12,
        color: "#fff" 
    })
        .setScrollFactor(0);

    this.rewardsTitleTxt = this.add.text(354, 164, this.cache.json.get("language").quest["rewards"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 14,
        color: "#fff" 
    })
        .setScrollFactor(0);

    this.questContainer.add(this.requisitsTitleTxt);
    this.questContainer.add(this.requisitsTxt);
    this.questContainer.add(this.rewardsTitleTxt);

    const itemsSlot = [];

    for (let i = 0; i < this.database.quests[this.currentQuestId].rewards.length; i ++) {
        itemsSlot[i] = this.add.sprite(this.database.interface.quest.rewards[i].x, this.database.interface.quest.rewards[i].y, "quest-item-slot")
            .setOrigin(0, 0)
            .setScrollFactor(0);

        const 
            reward = this.database.quests[this.currentQuestId].rewards[i],
            questAmount = [],
            item = [],
            valueTxt = [];

        switch (reward.type) {
            case "silver": {
                item[i] = this.add.sprite(0, 0, "coin-silver")
                    .setOrigin(0.5, 0.5)
                    .setScrollFactor(0)
                    .setX(itemsSlot[i].getCenter().x)
                    .setY(itemsSlot[i].getCenter().y);
                
                questAmount[i] = this.add.sprite(0, 0, "quest-amount-bg")
                    .setOrigin(0, 0)
                    .setScrollFactor(0)
                    .setX(itemsSlot[i].x + 14)
                    .setY(itemsSlot[i].y + 13);

                valueTxt[i] = this.add.text(0, 0, this.treatNumberToK(reward.amount), { 
                    fontFamily: "Century Gothic", 
                    fontSize: 8, 
                    color: "#fff" 
                })
                    .setOrigin(0.5, 0.5)
                    .setScrollFactor(0)
                    .setX(questAmount[i].getCenter().x)
                    .setY(questAmount[i].getCenter().y);

                break;
            };
            case "item": {
                ;
                item[i] = this.add.sprite(0, 0, this.treatItemIcon(reward.item_id))
                    .setOrigin(0.5, 0.5)
                    .setScrollFactor(0)
                    .setX(itemsSlot[i].getCenter().x)
                    .setY(itemsSlot[i].getCenter().y);

                questAmount[i] = this.add.sprite(0, 0, "quest-amount-bg")
                    .setOrigin(0, 0)
                    .setScrollFactor(0)
                    .setX(itemsSlot[i].x + 14)
                    .setY(itemsSlot[i].y + 13);

                valueTxt[i] = this.add.text(0, 0, "x" + reward.amount, {
                    fontFamily: "Century Gothic", 
                    fontSize: 8, 
                    color: "#fff" 
                })
                    .setOrigin(0.5, 0.5)
                    .setScrollFactor(0)
                    .setX(questAmount[i].getCenter().x)
                    .setY(questAmount[i].getCenter().y);
                break;
            };
        };

        this.questContainer.add(itemsSlot[i]);
        this.questContainer.add(item[i]);
        this.questContainer.add(questAmount[i]);
        this.questContainer.add(valueTxt[i]);
    };
};

Overworld.appendAcceptRejectQuest = function (quest_id) {

    console.log("OLÁ PORRA CRL!");

    this.acceptRejectBase = this.add.sprite(55, 35, "quest-accept-base")
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.questTitle = this.add.text(this.cameras.main.width / 2, 60, this.database.quests[quest_id].name[this.lang].replace(/(\r\n|\n|\r)/gm, ""), {
        fontFamily: "Century Gothic",
        fontSize: 24,
        color: "#fff"
    })
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0);

    this.acceptBtn = new Button(this, {
        x: 109,
        y: 155,
        spritesheet: "quest-btn-accept",
        on: {
            click: () => {
                this.requestStartQuest({
                    quest_id
                });
                this.questRewardsContainer
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });

    this.questCloseBtn2 = new Button(this, {
        x: 408,
        y: 43,
        spritesheet: "profile-close-btn",
        on: {
            click: () => {
                this.clearAcceptRejectQuest();
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });

    this.questCloseBtn2.sprite
        .setOrigin(0, 0)
        .setScrollFactor(0);

    //this.containers.interface.add(btn.sprite);
    this.acceptBtn.sprite.setScrollFactor(0);

    this.acceptBtnText = this.add.text(0, 0, this.cache.json.get("language").quest["accept"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(this.acceptBtn.sprite.getCenter().x)
        .setY(this.acceptBtn.sprite.getCenter().y - 3);

    this.questRewardText = this.add.text(0, 0, this.cache.json.get("language").quest["rewards"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 12, 
        color: "#fff" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(this.acceptRejectBase.getCenter().x)
        .setY(89);

    this.appendAcceptRejectQuestRewards(quest_id);
};

Overworld.appendAcceptRejectQuestRewards = function (quest_id) {
    this.questRewardsContainer = this.add.container();
    const itemsSlot = [];

    for (let i = 0; i < this.database.quests[quest_id].rewards.length; i ++) {
        itemsSlot[i] = this.add.sprite(this.database.interface.quest.acceptrejectrewards[i].x, this.database.interface.quest.acceptrejectrewards[i].y, "quest-item-slot")
            .setOrigin(0, 0)
            .setScrollFactor(0);

        const 
            reward = this.database.quests[quest_id].rewards[i],
            questAmount = [],
            item = [],
            valueTxt = [];

        switch (reward.type) {
            case "silver": {
                item[i] = this.add.sprite(0, 0, "coin-silver")
                    .setOrigin(0.5, 0.5)
                    .setScrollFactor(0)
                    .setX(itemsSlot[i].getCenter().x)
                    .setY(itemsSlot[i].getCenter().y);
                
                questAmount[i] = this.add.sprite(0, 0, "quest-amount-bg")
                    .setOrigin(0, 0)
                    .setScrollFactor(0)
                    .setX(itemsSlot[i].x + 14)
                    .setY(itemsSlot[i].y + 13);

                valueTxt[i] = this.add.text(0, 0, this.treatNumberToK(reward.amount), { 
                    fontFamily: "Century Gothic", 
                    fontSize: 8, 
                    color: "#fff" 
                })
                    .setOrigin(0.5, 0.5)
                    .setScrollFactor(0)
                    .setX(questAmount[i].getCenter().x)
                    .setY(questAmount[i].getCenter().y);

                break;
            };
            case "item": {
                ;
                item[i] = this.add.sprite(0, 0, this.treatItemIcon(reward.item_id))
                    .setOrigin(0.5, 0.5)
                    .setScrollFactor(0)
                    .setX(itemsSlot[i].getCenter().x)
                    .setY(itemsSlot[i].getCenter().y);

                questAmount[i] = this.add.sprite(0, 0, "quest-amount-bg")
                    .setOrigin(0, 0)
                    .setScrollFactor(0)
                    .setX(itemsSlot[i].x + 14)
                    .setY(itemsSlot[i].y + 13);

                valueTxt[i] = this.add.text(0, 0, "x" + reward.amount, {
                    fontFamily: "Century Gothic", 
                    fontSize: 8, 
                    color: "#fff" 
                })
                    .setOrigin(0.5, 0.5)
                    .setScrollFactor(0)
                    .setX(questAmount[i].getCenter().x)
                    .setY(questAmount[i].getCenter().y);
                break;
            };
        };

        this.questRewardsContainer.add(itemsSlot[i]);
        this.questRewardsContainer.add(item[i]);
        this.questRewardsContainer.add(questAmount[i]);
        this.questRewardsContainer.add(valueTxt[i]);
    };
};

Overworld.questChangePage = function (page) {
    
    this.requestQuestsList(page, data => {

        if (!data.length)
            return;

        this.clearQuestList();
        this.appendQuestList(data);
    });
};

Overworld.clearQuestList = function () {
    for (let i = 0; i < this.questDiv.length; i ++)
        this.questDiv[i].destroy();

    for (let i = 0; i < this.questTitleTxt.length; i ++)
        this.questTitleTxt[i].destroy();
};

Overworld.clearQuestsInterface = function () {
    this.questBase.destroy();
    this.questCloseBtn.sprite.destroy();
    this.questPaginationLeft.sprite.destroy();
    this.questPaginationRight.sprite.destroy();

    this.clearQuestList();

    if (this.hasSpecificQuestInterface)
        this.clearSpecificQuest();

    this.player._data.stop = false;
};

Overworld.clearSpecificQuest = function () {

    this.hasSpecificQuestInterface = false;

    this.questContainer.destroy();

    this.requisitsTitleTxt.destroy();
    this.requisitsTxt.destroy();
    this.rewardsTitleTxt.destroy();
};

Overworld.clearAcceptRejectQuest = function () {
    this.acceptRejectBase.destroy();
    this.questTitle.destroy();
    this.questRewardText.destroy();
    this.acceptBtn.sprite.destroy();
    this.questCloseBtn2.sprite.destroy();
    this.acceptBtnText.destroy();
    this.questRewardsContainer.destroy();
};

Overworld.treatItemIcon = function (id) {

    switch (id) {
        case 1: {
            return "magic-seal";
        };
        case 6: {
            return "super-potion";
        };
    };
};

Overworld.treatNumberToK = function (num) {
    // se for maior de mil converte pra k, ex.: 1200 -> 1,2k
    if (num >= 1000 && num < 1000000) {
        num /= 1000;
        num += "k";

        num = num.replace(".", ",");
    };
    // se for maior de um milhão converte pra kk, ex.: 4250000 -> 4,25kk
    if (num >= 1000000) {
        num /= 1000000;
        num += "kk";

        num = num.replace(".", ",");
    };

    return num;
};

// condições climáticas
Overworld.weather = {};

// chuva
Overworld.weather.rain = function () {
    this.add.particles("rain", [
        {
            angle: { min: 0, max: 360 },
            // emitZone: { source: offscreen },
            // deathZone: { source: screen, type: "onLeave" },
            frequency: 60,
            speedY: { min: 300, max: 900 },
            x: {min: 0, max: this.layer[0].width},
            y: 0,
            lifespan: Infinity,
            scale: 0.5,
            radial: true,
            rotation: 180
        },
        {
            angle: { min: 0, max: 360 },
            // emitZone: { source: offscreen },
            // deathZone: { source: screen, type: "onLeave" },
            frequency: 60,
            speedY: { min: 300, max: 900 },
            x: {min: 0, max: this.layer[0].width},
            y: 0,
            lifespan: Infinity,
            scale: 0.8,
            radial: true,
            rotation: 180
        },
        {
            angle: { min: 0, max: 360 },
            // emitZone: { source: offscreen },
            // deathZone: { source: screen, type: "onLeave" },
            frequency: 60,
            angle: 180,
            speedY: { min: 300, max: 900 },
            y: 0,
            x: {min: 0, max: this.layer[0].width},
            lifespan: Infinity,
            scale: 0.3,
            radial: true,
            rotation: 180
        },
        {
            angle: { min: 0, max: 360 },
            // emitZone: { source: offscreen },
            // deathZone: { source: screen, type: "onLeave" },
            frequency: 60,
            angle: 180,
            speedY: { min: 300, max: 900 },
            y: 0,
            x: {min: 0, max: this.layer[0].width},
            lifespan: Infinity,
            scale: 1.2,
            radial: true,
            rotation: 180
        },
        {
            angle: { min: 0, max: 360 },
            // emitZone: { source: offscreen },
            // deathZone: { source: screen, type: "onLeave" },
            frequency: 60,
            angle: 180,
            speedY: { min: 300, max: 900 },
            y: 0,
            x: {min: 0, max: this.layer[0].width},
            lifespan: Infinity,
            radial: true,
            scale: 0.7,
            rotation: 180
        },
        {
            angle: { min: 0, max: 360 },
            // emitZone: { source: offscreen },
            // deathZone: { source: screen, type: "onLeave" },
            frequency: 60,
            angle: 180,
            speedY: { min: 300, max: 900 },
            y: 0,
            x: {min: 0, max: this.layer[0].width},
            lifespan: Infinity,
            radial: true,
            scale: 0.35,
            rotation: 180
        },
        {
            angle: { min: 0, max: 360 },
            // emitZone: { source: offscreen },
            // deathZone: { source: screen, type: "onLeave" },
            frequency: 60,
            angle: 180,
            speedY: { min: 300, max: 900 },
            y: 0,
            x: {min: 0, max: this.layer[0].width},
            lifespan: Infinity,
            radial: true,
            rotation: 180,
            scale: 0.22
        },
        {
            angle: { min: 0, max: 360 },
            // emitZone: { source: offscreen },
            // deathZone: { source: screen, type: "onLeave" },
            frequency: 60,
            angle: 180,
            speedY: { min: 300, max: 900 },
            y: 0,
            x: {min: 0, max: this.layer[0].width},
            lifespan: Infinity,
            radial: true,
            rotation: 180,
            scale: 0.9
        },
        {
            angle: { min: 0, max: 360 },
            // emitZone: { source: offscreen },
            // deathZone: { source: screen, type: "onLeave" },
            frequency: 60,
            angle: 180,
            speedY: { min: 300, max: 900 },
            y: 0,
            x: {min: 0, max: this.layer[0].width},
            lifespan: Infinity,
            radial: true,
            rotation: 180,
            scale: 0.15
        } 
    ]);
};

Overworld.depthSort = function () {

    const 
        sprites = [],
        order = [];

    this.containers.main.iterate( sprite => {

        let _order = sprite.y + sprite.height / 2;

        sprites.push({
            gameobject: sprite,
            order: _order
        });

        order.push(_order);
    });

    order.sort();

    for (let i = 0; i < order.length; i ++)
        this.containers.main.bringToTop(sprites.find(sprite => sprite.order == order[i]).gameobject);
};

// delay para evitar bugs de posição do player online
Overworld.mapEntranceDelay = function () {
    this.player._data.stop = true;

    this.time.addEvent({delay: this.database.overworld.time.step * 8, callback: () => {
        this.player._data.stop = false;
    }});
};

// mostrar/ocultar monstros na party
Overworld.toggleParty = function () {

    this.player._data.stop = true;
    this.appendPartyInterface();
};
// mostrar/ocultar chat
Overworld.toggleChat = function () {
    this.statusShowingChat = !this.statusShowingChat;

    console.log("statusShowingChat", this.statusShowingChat);

    if (!this.statusShowingChat) {
        // efeito fadeout
        this.tweens.add({
            targets: this.chatTextArea,
            ease: "Linear",
            duration: 600,
            alpha: 0,
            onComplete: () => {
                this.chatTextArea.visible = false;
            }
        });

        //Elements.chat.querySelector("[data-type=chat]").style.display = "none";

        return;
    };

    this.appendChatMessages();
};
// mostrar quests
Overworld.toggleQuests = function () {
    this.player._data.stop = true;
    this.appendQuests();
};

// mostrar/ocultar notificações
Overworld.toggleNotifications = function () {
    this.statusShowingNotifications = !this.statusShowingNotifications;

    if (!this.statusShowingNotifications) {
        this.clearNotifications();
        return;
    };

    this.appendNotifications();
};

Overworld.appendWildMenu = function (data) {
    console.log("OLA KK 1233JGHFMHDFJGH");
    this.interfacesHandler.wildMenu = new WildMenu(this, data);
    this.interfacesHandler.wildMenu.append(data);
    this.containers.interface.add(this.interfacesHandler.wildMenu);
};

Overworld.appendWildTooltip = function (data) {

    // se já estiver aberto remove o tooltip
    if (this.wildTooltipOppened) {
        this.clearWildTooltip();
        return;
    };

    this.wildTooltipOppened = true;

    // se pode ver os Singular Points
    if (data.canSeeSP) {
        this.wildTooltip = this.add.sprite(
            226,
            31,
            "wild-tooltip-special"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0);
        this.containers.interface.add(this.wildTooltip);


        this.wildHpIcon = this.add.sprite(
            234,
            42,
            "icons"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setFrame("attr_hp");
        this.containers.interface.add(this.wildHpIcon);

        this.wildAtkIcon = this.add.sprite(
            236,
            67,
            "icons"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setFrame("attr_atk");
        this.containers.interface.add(this.wildAtkIcon);

        this.wildDefIcon = this.add.sprite(
            234,
            93,
            "icons"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setFrame("attr_def");
        this.containers.interface.add(this.wildDefIcon);

        this.wildSpeIcon = this.add.sprite(
            234,
            121,
            "icons"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setFrame("attr_spe");
        this.containers.interface.add(this.wildSpeIcon);

        this.wildHpValue = this.add.text(0, 0, data.hp, { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000"
        })
            .setX(this.wildHpIcon.x + this.wildHpIcon.displayWidth + 10)
            .setY(this.wildHpIcon.y)
            .setScrollFactor(0);
        this.containers.interface.add(this.wildHpValue);

        this.wildAtkValue = this.add.text(0, 0, data.atk, { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000"
        })
            .setX(this.wildAtkIcon.x + this.wildAtkIcon.displayWidth + 10)
            .setY(this.wildAtkIcon.y)
            .setScrollFactor(0);
        this.containers.interface.add(this.wildAtkValue);

        this.wildDefValue = this.add.text(0, 0, data.def, { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000"
        })
            .setX(this.wildDefIcon.x + this.wildDefIcon.displayWidth + 10)
            .setY(this.wildDefIcon.y)
            .setScrollFactor(0);
        this.containers.interface.add(this.wildDefValue);

        this.wildSpeValue = this.add.text(0, 0, data.spe, { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000"
        })
            .setX(this.wildSpeIcon.x + this.wildSpeIcon.displayWidth + 10)
            .setY(this.wildSpeIcon.y)
            .setScrollFactor(0);
        this.containers.interface.add(this.wildSpeValue);

        this.wildLevelText = this.add.text(232, 148, "Level: " + data.level, { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000" 
        })
            .setScrollFactor(0);
           
        this.containers.interface.add(this.wildLevelText);
    } else {
        this.wildTooltip = this.add.sprite(
            224,
            140,
            "wild-tooltip"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0);
        this.wildTooltip.setScrollFactor(0);
        this.containers.interface.add(this.wildTooltip);

        this.wildLevelText = this.add.text(232, 151, "Level: " + data.level, { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#000" 
        })
            .setScrollFactor(0);
           
        this.containers.interface.add(this.wildLevelText);
    };
};

Overworld.clearWildTooltip = function () {
    switch (this.wildTooltipType) {
        case 0: {
            this.wildTooltip.destroy();
            this.wildLevelText.destroy();
            break;
        };
        case 1: {
            this.wildTooltip.destroy();
            this.wildHpIcon.destroy();
            this.wildAtkIcon.destroy();
            this.wildDefIcon.destroy();
            this.wildSpeIcon.destroy();
            this.wildHpValue.destroy();
            this.wildAtkValue.destroy();
            this.wildDefValue.destroy();
            this.wildSpeValue.destroy();
            this.wildLevelText.destroy();
            break;
        };
    };

    this.wildTooltipOppened = false;
};

Overworld.appendPartyInterface = function () {
    this.interfacesHandler.party = new Party(this, {type: "party"});
    this.interfacesHandler.party.append();
};

Overworld.appendBag = function () {
    this.interfacesHandler.bag = new Bag(this);
    this.interfacesHandler.bag.append();
};

// (método principal) excluir interfaces de maneira genérica
Overworld.clearInterface = function () {
    _.each(this.btn, btn => btn.sprite.destroy());
    _.each(this.text, text => text.destroy());

    this.btn = {};
    this.text = {};
};

Overworld.clearWildBoxInterface = function () {
    this.wildBox.destroy();
    this.rating.destroy();
};

Overworld.showHideDPad = function (bool) {
    if (this.isMobile)
        _.each(this.dpad, element => {
            element.sprite.visible = bool;
        });
};

Overworld.enableDisableButtonsInterface = function (bool) {
    _.each(this.icon, button => {
        button.sprite.input.enabled = bool;
    });
};

Overworld.appendMonsterBox = function (data) {

    if (this.isMonsterBoxOppened) {
        console.log("I FEEL LIKE DYING");
        this.Data.BoxMonsters = data;
        //console.log(data.find(monster => monster.monsterpedia_id === 15));
        this.boxPageLimits.max = 32 * this.currentBoxPage;
        this.boxPageLimits.min = this.boxPageLimits.max - 32;
        this.boxPageLimits.max --;
        this.clearInBoxSlotsStates();
        this.clearInBoxMonsters();
        this.appendInBoxMonsters();
        return;
    };

    this.currentBoxPage = 1;
    this.boxPageLimits = {};
    this.boxPageLimits.max = 32 * this.currentBoxPage;
    this.boxPageLimits.min = this.boxPageLimits.max - 32;
    this.boxPageLimits.max --;


    this.isMonsterBoxOppened = true;

    this.boxBg = this.add.sprite(
        15,
        5,
        "box-background"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.containers.interface.add(this.boxBg);


    this.boxInParty = this.add.sprite(
        81,
        12,
        "box-in-party"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.containers.interface.add(this.boxInParty);

    this.boxInfo = this.add.sprite(
        327,
        21,
        "box-info"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.containers.interface.add(this.boxInfo);

    this.boxClose = new Button(this, {
        x: 447,
        y: 11,
        spritesheet: "profile-close-btn",
        on: {
            click: () => {
                this.clearBox();
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });

    this.boxClose.sprite
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.containers.interface.add(this.boxClose.sprite);

    this.boxPaginationLeft = new Button(this, {
        x: 279,
        y: 57,
        spritesheet: "box-pagination",
        on: {
            click: () => {
                console.log("left");
                --this.currentBoxPage;
                if (this.currentBoxPage == 1)
                    this.boxPaginationLeft.sprite.input.enabled = false;

                this.requestBoxPageChange({page: this.currentBoxPage});
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });

    this.boxPaginationLeft.sprite
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.boxPaginationLeft.sprite.input.enabled = false;

    this.containers.interface.add(this.boxPaginationLeft.sprite);

    this.boxPaginationRight = new Button(this, {
        x: 295,
        y: 57,
        spritesheet: "box-pagination",
        on: {
            click: () => {
                console.log("right");
                this.boxPaginationLeft.sprite.input.enabled = true;
                ++this.currentBoxPage;

                this.requestBoxPageChange({page: this.currentBoxPage});
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });

    this.boxPaginationRight.sprite
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.boxPaginationRight.sprite.flipX = true;

    this.containers.interface.add(this.boxPaginationRight.sprite);

    const 
        inPartyBtn = [],
        inBoxBtn = [],
        inBoxMonsters = [];

    this.boxSprites = {inPartyBtn, inBoxBtn, inBoxMonsters};

    for (let i = 0; i < this.database.interface.box.partyslots.length; i ++) {
        inPartyBtn[i] = new Button(this, {
            x: this.database.interface.box.partyslots[i].x,
            y: this.database.interface.box.partyslots[i].y,
            spritesheet: "box-btn-slot",
            on: {
                click: () => {
                    console.log("click!");
                }
            },
            frames: {click: 2, over: 1, up: 1, out: 0}
        });
        inPartyBtn[i].sprite.setScrollFactor(0);
        this.containers.interface.add(inPartyBtn[i].sprite);
    };

    console.log(this.database.interface.box.boxslots.length, "HEYAO");

    for (let i = 0; i < this.database.interface.box.boxslots.length; i ++) {
        inBoxBtn[i] = new Button(this, {
            x: this.database.interface.box.boxslots[i].x,
            y: this.database.interface.box.boxslots[i].y,
            spritesheet: "box-btn-slot",
            on: {
                click: () => {
                    this.clearInBoxSelectedMonsterInfo();
                    this.appendInBoxMonsterInfo(i);
                }
            },
            frames: {click: 2, over: 1, up: 1, out: 0}
        });
        inBoxBtn[i].sprite.setScrollFactor(0);
        this.containers.interface.add(inBoxBtn[i].sprite);
        inBoxBtn[i].isEmpty = true;
        inBoxBtn[i].sprite.input.enabled = false;

    };

    this.Data.BoxMonsters = data;

    this.appendInPartyMonsters();
    this.appendInBoxMonsters();

    //console.log(inPartyBtn, inBoxBtn);
};

Overworld.inPartyOnDragEnd = function (monster, index) {
    //console.log(monster, index);
    const 
        width = 37, 
        height = 34;

    // cacheia posição
    const slotPosition = _.clone({
        x: monster.getCenter().x,
        y: monster.getCenter().y
    });

    // itera todas as slots da party
    for (let i = 0; i < 6; i ++) {

        // se for ele mesmo, vai pro próximo
        if (i == index)
            continue;

        // pegar posição do "mouse" (na vdd o centro da sprite slot)
        if (slotPosition.x >= this.boxSprites.inPartyBtn[i].sprite.x && slotPosition.x <= this.boxSprites.inPartyBtn[i].sprite.x + width && 
           slotPosition.y >= this.boxSprites.inPartyBtn[i].sprite.y && slotPosition.y <= this.boxSprites.inPartyBtn[i].sprite.y + height) {
            
            // se slot estiver vazia, manda de volta pro local de origem
            if (this.boxSprites.inPartyBtn[i].isEmpty) {
                monster.x = this.boxSprites.inPartyBtn[index].sprite.getCenter().x;
                monster.y = this.boxSprites.inPartyBtn[index].sprite.getCenter().y;
            } else {
                // criando novo objeto dos monstros do jogador
                let new_order = _.clone(this.Data.CurrentMonsters);

                // trocando monstros de lugar na variável
                this.Data.CurrentMonsters["monster" + index] = new_order["monster" + i];
                this.Data.CurrentMonsters["monster" + i] = new_order["monster" + index];

                // enviar requisição ao servidor de mudança
                this.requestChangePartyPosition(index, i);

                this.clearInPartyMonstersBox();

                // redesenha slots
                this.appendInPartyMonsters();
                return;
            };
            break;
        } else {
            // se não "colidir" com nenhuma slot: manda de volta pro local de origem
            monster.x = this.boxSprites.inPartyBtn[index].sprite.getCenter().x;
            monster.y = this.boxSprites.inPartyBtn[index].sprite.getCenter().y;
        };
    };

    // itera todas as slots da box
    for (let i = 0; i < this.boxSprites.inBoxBtn.length; i ++) {
        // pegar posição do "mouse" (na vdd o centro da sprite slot)
        if (slotPosition.x >= this.boxSprites.inBoxBtn[i].sprite.x && slotPosition.x <= this.boxSprites.inBoxBtn[i].sprite.x + width && 
           slotPosition.y >= this.boxSprites.inBoxBtn[i].sprite.y && slotPosition.y <= this.boxSprites.inBoxBtn[i].sprite.y + height) {
            
            if (this.boxSprites.inBoxBtn[i].isEmpty) {

                console.log("inPartyOnDragEnd - inBoxBtn - isEmpty");
                console.log(this.database.monsters[this.Data.CurrentMonsters["monster" + index].monsterpedia_id].name);

                this.Data.BoxMonsters[i] = _.clone(this.Data.CurrentMonsters["monster" + index]);
                this.Data.BoxMonsters[i].slot_position = this.boxPageLimits.min + i;

                delete this.Data.CurrentMonsters["monster" + index];

                console.log(this.Data.BoxMonsters[i]);

                // monster.x = this.boxSprites.inBoxBtn[i].sprite.getCenter().x;
                // monster.y = this.boxSprites.inBoxBtn[i].sprite.getCenter().y;
                // re-questar vazio
                this.requestChangePartyToEmptyBox(
                    this.boxPageLimits.min + index,
                    this.boxPageLimits.min + i
                );

                // reorganiza party
                this.reorganizeParty();

                // limpa
                this.clearInPartyMonstersBox();

                // redesenha slots
                this.appendInPartyMonsters();

                // desabilita slots da box para atualizar
                this.clearInBoxSlotsStates();

                //this.requestBoxPageChange({page: this.currentBoxPage});
            } else {

                console.log("inPartyOnDragEnd - inBoxBtn - isNotEmpty");
                console.log("party pra box");
                // index = monstro na party
                // i = monstro na box
                // será efetuada uma troca da party pra box

                // criando novo objeto dos monstros do jogador
                let new_order = {
                    party: { ... this.Data.CurrentMonsters },
                    box: { ... this.Data.BoxMonsters }
                };

                console.log({monsterNaParty: index, monsterNaBox: i});
                console.log(this.boxSprites.inBoxBtn[i]);

                let newI = _.findIndex(this.Data.BoxMonsters, {slot_position: this.boxPageLimits.min + i});

                console.log("RAPE ME", new_order.party["monster" + index], newI);
                this.Data.CurrentMonsters["monster" + index] = new_order.box[newI];
                this.Data.BoxMonsters[newI] = new_order.party["monster" + index];
                this.Data.BoxMonsters[newI].slot_position = this.boxPageLimits.min + i;

                console.log({i: this.boxPageLimits.min + i, index});

                this.requestChangeBoxToParty(
                    this.boxPageLimits.min + i,
                    index
                );

                // limpa
                this.clearInPartyMonstersBox();
                this.clearInBoxMonsters();

                // redesenha slots
                this.appendInPartyMonsters();
                this.appendInBoxMonsters();
            };
        };
    };
};

Overworld.inBoxOnDragEnd = function (monster, index) {
    //console.log("Oii, vc está na box", monster, index);

    const data = {
        index: _.findIndex(this.Data.BoxMonsters, {slotSpritePosition: index})
    };

    //console.log("tnc pow", mons, index);

    const
        width = 37, 
        height = 34;

    // cacheia posição
    const slotPosition = _.clone({
        x: monster.getCenter().x,
        y: monster.getCenter().y
    });

    // itera todas as slots da party
    for (let i = 0; i < 6; i ++) {

        // pegar posição do "mouse" (na vdd o centro da sprite slot)
        if (slotPosition.x >= this.boxSprites.inPartyBtn[i].sprite.x && slotPosition.x <= this.boxSprites.inPartyBtn[i].sprite.x + width && 
           slotPosition.y >= this.boxSprites.inPartyBtn[i].sprite.y && slotPosition.y <= this.boxSprites.inPartyBtn[i].sprite.y + height) {

            // se slot estiver vazia
            if (this.boxSprites.inPartyBtn[i].isEmpty) {
                console.log("inBoxOnDragEnd - inPartyBtn - isEmpty");
                // this is the next - box to emty party
                this.Data.CurrentMonsters["monster" + i] = { ... this.Data.BoxMonsters[data.index] };
                delete this.Data.BoxMonsters[data.index];
                this.boxSprites.inBoxBtn[index].isEmpty = true;
                //this.Data.BoxMonsters[data.index] = {isEmpty: true};
                this.requestChangeBoxToEmptyParty(
                    this.boxPageLimits.min + index,
                    i
                );

                // reorgarnizar party
                this.reorganizeParty();

                // redesenha slots e limpa
                this.clearInPartyMonstersBox();
                this.clearInBoxMonsters();

                this.appendInPartyMonsters();
                this.appendInBoxMonsters();

            } else {
                console.log("inBoxOnDragEnd - inPartyBtn - isNotEmpty");
                console.log("box pra party");
                // last one
                // criando novo objeto dos monstros do jogador
                let new_order = { ... this.Data.CurrentMonsters };

                // index = monstro na box
                // i =  monstro na party
                // será efetuada uma troca da party pra box

                // trocando monstros de lugar na variável
                //this.Data.CurrentMonsters["monster" + index] = new_order["monster" + i];
                //this.Data.CurrentMonsters["monster" + i] = new_order["monster" + index];
                this.Data.CurrentMonsters["monster" + i] = this.Data.BoxMonsters[data.index];
                delete this.Data.CurrentMonsters["monster" + i].slot_position;
                this.Data.BoxMonsters[data.index] = new_order["monster" + i];
                this.Data.BoxMonsters[data.index].slot_position = this.boxPageLimits.min + index;
                this.boxSprites.inBoxBtn[i].isEmpty = false;
                
                // enviar requisição ao servidor de mudança
                this.requestChangeBoxToParty(this.boxPageLimits.min + index, i);

                // redesenha slots e limpa
                this.clearInPartyMonstersBox();
                this.clearInBoxMonsters();
                this.appendInPartyMonsters();
                this.appendInBoxMonsters();

                return;
            };
            break;
        } else {
            // se não "colidir" com nenhuma slot: manda de volta pro local de origem
            monster.x = this.boxSprites.inBoxBtn[index].sprite.getCenter().x;
            monster.y = this.boxSprites.inBoxBtn[index].sprite.getCenter().y;
        };
    };


    // itera todas as slots da box
    for (let i = 0; i < this.boxSprites.inBoxBtn.length; i ++) {
        // pegar posição do "mouse" (na vdd o centro da sprite slot)
        if (slotPosition.x >= this.boxSprites.inBoxBtn[i].sprite.x && slotPosition.x <= this.boxSprites.inBoxBtn[i].sprite.x + width && 
           slotPosition.y >= this.boxSprites.inBoxBtn[i].sprite.y && slotPosition.y <= this.boxSprites.inBoxBtn[i].sprite.y + height) {
            //console.log("Uau, está dentro da inbox slot", i, this.boxSprites.inBoxBtn[i].isEmpty);

            console.log(i, this.boxSprites.inBoxBtn[i]);

            if (this.boxSprites.inBoxBtn[i].isEmpty) {

                console.log("Olá, entrou no empty.");

                // arruma array de box monsters
                let new_order = _.clone(this.Data.BoxMonsters[data.index]);
                new_order.slot_position = this.boxPageLimits.min + i;
                this.Data.BoxMonsters.push(new_order);
                delete this.Data.BoxMonsters[data.index];

                // re-set dos botões
                this.boxSprites.inBoxBtn[index].isEmpty = true;
                this.boxSprites.inBoxBtn[index].sprite.input.enabled = false;
                this.boxSprites.inBoxBtn[i].isEmpty = false;
                

                //console.log({index: this.boxPageLimits.min + index, i: this.boxPageLimits.min + i});
                // requisita ao servidor mudar de posição
                this.requestChangeBoxPosition(
                    this.boxPageLimits.min + index,
                    this.boxPageLimits.min + i
                );

                // monster.x = this.boxSprites.inBoxBtn[i].sprite.getCenter().x;
                // monster.y = this.boxSprites.inBoxBtn[i].sprite.getCenter().y;

                // limpa
                this.clearInPartyMonstersBox();
                this.clearInBoxMonsters();

                // redesenha slots
                this.appendInPartyMonsters();
                this.appendInBoxMonsters();

                break;
            } else {

                console.log(this.Data.BoxMonsters);
                console.log("Olá, entrou no NOT empty.");

                monster.x = this.boxSprites.inBoxBtn[index].sprite.getCenter().x;
                monster.y = this.boxSprites.inBoxBtn[index].sprite.getCenter().y;

                return;

                console.log({indexAtual: data.index, indexDoQueVaiTrocar: _.findIndex(this.Data.BoxMonsters, {slot_position: i})});
                console.log("---------------------");
                console.log({indexAtual: index, indexDoQueVaiTrocar: i});

                // criando novo objeto dos monstros do jogador
                let new_order = _.clone(this.Data.BoxMonsters),
                    ii = _.findIndex(this.Data.BoxMonsters, {slot_position: i});

                //return;
                // console.log("first index", index, ii);
                // console.log("raw monsterpedia", this.Data.BoxMonsters[index].monsterpedia_id, this.Data.BoxMonsters[ii].monsterpedia_id);
                // console.log("clone", new_order[index].monsterpedia_id, new_order[ii].monsterpedia_id);

                // trocando monstros de lugar na variável
                delete this.Data.BoxMonsters[data.index];
                this.Data.BoxMonsters[data.index] = new_order[ii];
                this.Data.BoxMonsters[data.index].slot_position = ii;
                this.boxSprites.inBoxBtn[data.index].isEmpty = false;
                
                // delete this.Data.BoxMonsters[index];
                // let from = new_order[ii];
                // from.slot_position = ii;
                // this.Data.BoxMonsters.push(from);

                // delete this.Data.BoxMonsters[ii];
                // let to = new_order[index];
                // console.log(to);
                // to.slot_position = index;
                // this.Data.BoxMonsters.push(to);

                // console.log(this.Data.BoxMonsters);
                delete this.Data.BoxMonsters[ii];
                this.Data.BoxMonsters[ii] = new_order[data.index];
                this.Data.BoxMonsters[ii].slot_position = data.index;
                this.boxSprites.inBoxBtn[ii].isEmpty = false;

                // console.log("------------------------------");

                // console.log("second index", index, ii);
                // console.log("raw monsterpedia", this.Data.BoxMonsters[index].monsterpedia_id, this.Data.BoxMonsters[ii].monsterpedia_id);
                // console.log("clone", new_order[index].monsterpedia_id, new_order[ii].monsterpedia_id);



                // limpa
                this.clearInPartyMonstersBox();
                this.clearInBoxMonsters();

                // redesenha slots
                this.appendInPartyMonsters();
                this.appendInBoxMonsters();

                // data.index // index atual
                // _.findIndex(this.Data.BoxMonsters, {slot_position: i}) //
            };
        };
    };
};

Overworld.reorganizeParty = function () {
    const monstersArray = [];

    for (let i = 0; i < 6; i ++) {
        if (this.Data.CurrentMonsters["monster" + i]) {
            monstersArray.push(this.Data.CurrentMonsters["monster" + i]);
        };
    };

    for (let i = 0; i < 6; i ++) {
        if (monstersArray[i]) {
            this.Data.CurrentMonsters["monster" + i] = monstersArray[i];
        } else {
            this.Data.CurrentMonsters["monster" + i] = null;
        };
    };
};

Overworld.appendInPartyMonsters = function () {

    const inPartyMonsters = [];
    this.boxSprites.inPartyMonsters = inPartyMonsters;

    for (let i = 0; i < 6; i ++) {

        let monster = this.Data.CurrentMonsters["monster" + i];

        if (!monster) {
            this.boxSprites.inPartyBtn[i].isEmpty = true;
            this.boxSprites.inPartyBtn[i].sprite.input.enabled = false;
            continue;
        };

        this.boxSprites.inPartyBtn[i].isEmpty = false;

        this.boxSprites.inPartyMonsters[i] = this.add.existing(
            new RawCharacter(
                this,
                this.boxSprites.inPartyBtn[i].sprite.getCenter().x,
                this.boxSprites.inPartyBtn[i].sprite.getCenter().y,
                {
                    sprite: this.database.monsters[monster.monsterpedia_id].name,
                    position: {facing: 2}
                }
            )
        );

        this.boxSprites.inPartyMonsters[i]
            .setOrigin(0.5)
            .setScrollFactor(0)
            .changeOrigin(2);

        this.plugins.get("rexDrag").add(inPartyMonsters[i]);

        this.boxSprites.inPartyMonsters[i].on("dragend", () => this.inPartyOnDragEnd(inPartyMonsters[i], i));
    };
};

Overworld.appendInBoxMonsters = function () {
    for (let i = 0; i < 32; i ++) {

        let monster = this.Data.BoxMonsters[i];

        if (!monster)
            continue;

        monster.slotSpritePosition = (((this.currentBoxPage * this.database.interface.box.boxslots.length) - monster.slot_position) - 32) * -1;
        //console.log({currentPosition: monster.slot_position, page: this.currentBoxPage, totalSlots: this.database.interface.box.boxslots.length});
        
        while (monster.slotSpritePosition < 0) {
            monster.slotSpritePosition *= -1;
        };

        let index = monster.slotSpritePosition;

        //console.log(`${this.currentBoxPage} * ${this.database.interface.box.boxslots.length} - ${monster.slot_position} - 32 = ${monster.slotSpritePosition}`);

        this.boxSprites.inBoxBtn[index].isEmpty = false;
        this.boxSprites.inBoxBtn[index].sprite.input.enabled = true;

        this.boxSprites.inBoxMonsters[index] = this.add.existing(
            new RawCharacter(
                this,
                this.boxSprites.inBoxBtn[index].sprite.getCenter().x,
                this.boxSprites.inBoxBtn[index].sprite.getCenter().y,
                {
                    sprite: this.database.monsters[monster.monsterpedia_id].name,
                    position: {facing: 2}
                }
            )
        );

        this.boxSprites.inBoxMonsters[index]
            .setOrigin(0.5)
            .setScrollFactor(0)
            .changeOrigin(2);

        this.plugins.get("rexDrag").add(this.boxSprites.inBoxMonsters[index]);

        this.boxSprites.inBoxMonsters[index].on("dragend", () => this.inBoxOnDragEnd(this.boxSprites.inBoxMonsters[index], index, i));
    };
};

Overworld.appendInBoxMonsterInfo = function (i) {

    const monster = _.findWhere(this.Data.BoxMonsters, {slotSpritePosition: i});

    if (!monster)
        return;

    this.inBoxSelectedMonsterInfo = {};
    this.inBoxTxt = {};

    this.loadMonsterSprite(monster.monsterpedia_id, () => {
        this.inBoxSelectedMonsterInfo.sprite = this.add.sprite(
            this.database.interface.box.monsters[monster.monsterpedia_id].x,
            this.database.interface.box.monsters[monster.monsterpedia_id].y,
            "monster_" + monster.monsterpedia_id
        )
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.inBoxSelectedMonsterInfo.sprite.flipX = true;

        this.addMonsterAnimations(monster.monsterpedia_id, this.inBoxSelectedMonsterInfo.sprite);

        if (this.database.interface.box.monsters[monster.monsterpedia_id].scale)
            this.inBoxSelectedMonsterInfo.sprite.scale = this.database.interface.box.monsters[monster.monsterpedia_id].scale;

        this.inBoxTxt.attrNumber = this.add.text(
            343, 
            165,
            "Nº", 
            {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#000" 
            }
        )
            .setScrollFactor(0);

        this.inBoxTxt.attrLevel = this.add.text(
            343, 
            182,
            "Level", 
            {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#000" 
            }
        )
            .setScrollFactor(0);

        this.inBoxTxt.attrPower = this.add.text(
            343, 
            204,
            "Poder Total", 
            {
                fontFamily: "Century Gothic", 
                fontSize: 10, 
                color: "#000" 
            }
        )
            .setScrollFactor(0);


        this.inBoxTxt.valNumber = this.add.text(
            443, 
            163,
            "#" + this.numberToPedia(monster.monsterpedia_id) + " (" + monster.id + ")", 
            {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#000" 
            }
        )
            .setScrollFactor(0);

        this.inBoxTxt.valNumber.x -= this.inBoxTxt.valNumber.displayWidth;

        this.inBoxTxt.valLevel = this.add.text(
            443, 
            182,
            monster.level, 
            {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#000" 
            }
        )
            .setScrollFactor(0);

        this.inBoxTxt.valLevel.x -= this.inBoxTxt.valLevel.displayWidth;

        this.inBoxTxt.valPower = this.add.text(
            443, 
            202,
            monster.stats_HP + monster.stats_attack + monster.stats_defense + monster.stats_speed, 
            {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#000" 
            }
        )
            .setScrollFactor(0);

        this.inBoxTxt.valPower.x -= this.inBoxTxt.valPower.displayWidth;


        // txt = this.inBoxTxt.valLevel;
        // sprt = this.inBoxSelectedMonsterInfo.sprite;
    });
};

Overworld.clearInPartyMonstersBox = function () {
   for (let i = 0, l = this.boxSprites.inPartyMonsters.length; i < l; i ++)
        if (this.boxSprites.inPartyMonsters[i])
            this.boxSprites.inPartyMonsters[i].destroy();
};

Overworld.clearInBoxMonsters = function () {
   for (let i = 0, l = this.boxSprites.inBoxMonsters.length; i < l; i ++)
        if (this.boxSprites.inBoxMonsters[i])
            this.boxSprites.inBoxMonsters[i].destroy();
};

Overworld.clearInBoxSlotsStates = function () {
    for (let i = 0; i < this.boxSprites.inBoxBtn.length; i ++) {
        this.boxSprites.inBoxBtn[i].isEmpty = true;
        this.boxSprites.inBoxBtn[i].sprite.input.enabled = false;
    };
};

Overworld.clearInBoxSelectedMonsterInfo = function () {

    if (this.inBoxSelectedMonsterInfo) {
        _.each(this.inBoxSelectedMonsterInfo, el => el.destroy());
        _.each(this.inBoxTxt, el => el.destroy());
    };
};

Overworld.clearBox = function () {

    this.isMonsterBoxOppened = false;

    this.boxBg.destroy();
    this.boxInParty.destroy();
    this.boxInfo.destroy();
    this.boxPaginationLeft.sprite.destroy();
    this.boxPaginationRight.sprite.destroy();
    this.boxClose.sprite.destroy();
    this.clearInPartyMonstersBox();
    this.clearInBoxMonsters();
    this.clearInBoxSelectedMonsterInfo();

   for (let i = 0, l = this.boxSprites.inPartyBtn.length; i < l; i ++)
        if (this.boxSprites.inPartyBtn[i])
            this.boxSprites.inPartyBtn[i].sprite.destroy();

   for (let i = 0, l = this.boxSprites.inBoxBtn.length; i < l; i ++)
        if (this.boxSprites.inBoxBtn[i])
            this.boxSprites.inBoxBtn[i].sprite.destroy();
};

Overworld.appendPlayerProfileInterface = function (uid, nickname) {

    this.profileTexts = {};
    this.profileButtons = {};
    this.profileSlots = [];
    this.profileMonstersIcons = [];
    this.profileEmptysHelpers = {};

    // background
    this.profileBg = this.add.sprite(
        18,
        9,
        "profile-background"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();
    this.containers.interface.add(this.profileBg);

    // infos do profile
    this.profileInfo = this.add.sprite(
        28,
        9,
        "profile-info"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.containers.interface.add(this.profileInfo);

    for (let i = 0; i < 6; i ++) {
        this.profileSlots[i] = this.add.sprite(
            this.database.interface.profile.slots[i].x,
            this.database.interface.profile.slots[i].y,
            "profile-monster-slot"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0);
        this.containers.interface.add(this.profileSlots[i]);
    };

    // conquistas
    this.profileAchievements = this.add.sprite(
        130,
        69,
        "profile-achievements"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.profileAvatar = this.add.sprite(
        50,
        19,
        "placeholder-avatar"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();
    this.containers.interface.add(this.profileAvatar);

    this.containers.interface.add(this.profileAchievements);

    this.profileEmptysHelpers.nickname = this.add.sprite(
        42,
        145,
        "profile-empty"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.containers.interface.add(this.profileEmptysHelpers.nickname);

    this.profileTexts.nickname = this.add.text(0, 0, nickname, { 
        fontFamily: "Century Gothic", 
        fontSize: 12,
        color: "#fff" 
    })
        .setOrigin(0.5)
        .setX(this.profileEmptysHelpers.nickname.getCenter().x)
        .setY(this.profileEmptysHelpers.nickname.getCenter().y)
        .setScrollFactor(0);

    this.containers.interface.add(this.profileTexts.nickname);

    this.profileButtons.close = new Button(this, {
        x: 446,
        y: 12,
        spritesheet: "profile-close-btn",
        on: {
            click: () => {
                this.clearPlayerProfileInterface();
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });

    this.profileButtons.close.sprite.setScrollFactor(0);
    this.containers.interface.add(this.profileButtons.close.sprite);

    this.requestPlayerProfile(uid);

    this.isPlayerProfileOpenned = true;

    this.profileButtons.add = new Button(this, {
        x: 132,
        y: 197,
        spritesheet: "items-button",
        on: {
            click: () => {
                console.log("Add amigo");
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    this.profileButtons.add.sprite.setScrollFactor(0);
    this.profileButtons.add.sprite.scaleX = 0.8;
    this.profileButtons.add.sprite.scaleY = 0.8;
    this.containers.interface.add(this.profileButtons.add.sprite);

    this.profileTexts.add = this.add.text(0, 0, this.cache.json.get("language").profile.add[this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 12,
        color: "#fff" 
    })
        .setOrigin(0.5)
        .setX(this.profileButtons.add.sprite.getCenter().x)
        .setY(this.profileButtons.add.sprite.getCenter().y)
        .setScrollFactor(0);

    this.containers.interface.add(this.profileTexts.add);

    this.profileButtons.inviteBattle = new Button(this, {
        x: 241,
        y: 197,
        spritesheet: "items-button",
        on: {
            click: () => {
                this.requestPvPInvite(uid);
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    this.profileButtons.inviteBattle.sprite.setScrollFactor(0);
    this.profileButtons.inviteBattle.sprite.scaleX = 0.8;
    this.profileButtons.inviteBattle.sprite.scaleY = 0.8;
    this.containers.interface.add(this.profileButtons.inviteBattle.sprite);

    this.profileTexts.inviteBattle = this.add.text(0, 0, this.cache.json.get("language").profile.invitepvp[this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 12,
        color: "#fff" 
    })
        .setOrigin(0.5)
        .setX(this.profileButtons.inviteBattle.sprite.getCenter().x)
        .setY(this.profileButtons.inviteBattle.sprite.getCenter().y)
        .setScrollFactor(0);

    this.containers.interface.add(this.profileTexts.inviteBattle);

    this.profileButtons.block = new Button(this, {
        x: 351,
        y: 197,
        spritesheet: "items-button",
        on: {
            click: () => {
                console.log("bloq");
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    this.profileButtons.block.sprite.setScrollFactor(0);
    this.profileButtons.block.sprite.scaleX = 0.8;
    this.profileButtons.block.sprite.scaleY = 0.8;
    this.containers.interface.add(this.profileButtons.block.sprite);

    this.profileTexts.block = this.add.text(0, 0, this.cache.json.get("language").profile.block[this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 12,
        color: "#fff" 
    })
        .setOrigin(0.5)
        .setX(this.profileButtons.block.sprite.getCenter().x)
        .setY(this.profileButtons.inviteBattle.sprite.getCenter().y)
        .setScrollFactor(0);

    this.containers.interface.add(this.profileTexts.block);

    this.profileTexts.achievements = this.add.text(250, 72, this.cache.json.get("language").profile.achievements[this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 12,
        color: "#fff" 
    })
        .setScrollFactor(0);

    this.containers.interface.add(this.profileTexts.achievements);
};

Overworld.appendDynamicPlayerProfileInterface = function (data) {
    if (!this.isPlayerProfileOpenned)
        return;

    this.profileEmptysHelpers.rank = this.add.sprite(
        42,
        172,
        "profile-empty"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.containers.interface.add(this.profileEmptysHelpers.rank);

    console.log(data.player_data.rank, "HIHERAHUHA");

    this.profileTexts.rank = this.add.text(0, 0, this.database.rank[data.player_data.rank][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 12,
        color: "#fff" 
    })
        .setOrigin(0.5)
        .setX(this.profileEmptysHelpers.rank.getCenter().x)
        .setY(this.profileEmptysHelpers.rank.getCenter().y)
        .setScrollFactor(0);

    for (let i = 0; i < 6; i++) {

        let monster = data.monsters["monster" + i];

        if (!monster)
            continue;

        this.profileMonstersIcons[i] = this.add.existing(
            new RawCharacter(
                this,
                this.profileSlots[i].getCenter().x,
                this.profileSlots[i].getCenter().y,
                {
                    sprite: this.database.monsters[monster.monsterpedia_id].name,
                    position: {facing: 2}
                }
            )
        );

        this.profileMonstersIcons[i]
            .setOrigin(0.5)
            .setScrollFactor(0)
            .changeOrigin(2);
    };

    this.profileEmptysHelpers.clan = this.add.sprite(
        42,
        202,
        "profile-empty"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.containers.interface.add(this.profileEmptysHelpers.clan);

    let clanText = data.player_data.clan || this.cache.json.get("language").profile["noclan"][this.lang];

    this.profileTexts.clan = this.add.text(0, 0, clanText, { 
        fontFamily: "Century Gothic", 
        fontSize: 12,
        color: "#fff" 
    })
        .setOrigin(0.5)
        .setX(this.profileEmptysHelpers.clan.getCenter().x)
        .setY(this.profileEmptysHelpers.clan.getCenter().y)
        .setScrollFactor(0);
};

Overworld.clearPlayerProfileInterface = function () {
    this.profileBg.destroy();
    this.profileInfo.destroy();
    this.profileAvatar.destroy();
    this.profileAchievements.destroy();
    _.each(this.profileTexts, el => el.destroy());
    _.each(this.profileButtons, el => el.sprite.destroy());
    for (let i = 0; i < this.profileSlots.length; i ++)
        this.profileSlots[i].destroy();
    for (let i = 0; i < this.profileMonstersIcons.length; i ++) {
        if (this.profileMonstersIcons[i])
            this.profileMonstersIcons[i].destroy();
    };
    _.each(this.profileEmptysHelpers, el => el.destroy());

    this.isPlayerProfileOpenned = false;
};

Overworld.appendMarket = function () {

    // add bg
    this.mktBg = this.add.sprite(14, 5, "market-background")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();
    this.containers.interface.add(this.mktBg);

    // ad tab (categoria)
    this.mktTab = this.add.sprite(19, 12, "market-tab1")
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.containers.interface.add(this.mktTab);

    this.mktTabBtn = [];
    
    console.log(this.database.items.market[this.Data.CurrentMap], this.database.items.market[this.Data.CurrentMap].length);

    for (let i = 0; i < 5; i ++) {
        if (!this.database.items.market[this.Data.CurrentMap][i])
            continue;

        console.log(this.database.items.market[this.Data.CurrentMap][i].type);

        let tab = this.database.interface.market.tabs[i];
        //tab-party-button
        //80x30
        this.mktTabBtn[i] = new Button(this, {
            x: tab.x,
            y: tab.y,
            spritesheet: "tab-party-button",
            on: {
                click: () => {
                    console.log("tab > " + i);
                    this.mktTab.setTexture("market-tab" + (i + 1));
                    // categoria e página atual
                    this.mktCurrentCategory = i;
                    this.mktCurrentPage = 0;
                    // processa produtos da página
                    this.mktCategoryProducts = _.chunk(this.database.items.market[this.Data.CurrentMap][this.mktCurrentCategory].products, 12);
                    this.mktCurrentDisplayProducts = this.mktCategoryProducts[this.mktCurrentPage];
                    this.clearMarketSlotElements();
                    this.appendMarketSlotElements();
                }
            },
            frames: {click: 0, over: 0, up: 0, out: 0}
        });
        this.mktTabBtn[i].sprite.setScrollFactor(0);
        this.containers.interface.add(this.mktTabBtn[i].sprite);
        this.mktTabBtn[i].sprite.displayWidth = 80;
        this.mktTabBtn[i].sprite.displayHeight = 30;
    };

    // adiciona paginação (<<)
    this.mktPaginationPrevious = new Button(this, {
        x: 429,
        y: 48,
        spritesheet: "market-select-pagination",
        on: {
            click: () => {
                console.log("<<<");
                --this.mktCurrentPage;
                this.changeMarketPage();
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });
    this.mktPaginationPrevious.sprite.setScrollFactor(0);
    this.containers.interface.add(this.mktPaginationPrevious.sprite);

    // adiciona paginação (>>)
    this.mktPaginationNext = new Button(this, {
        x: 445,
        y: 48,
        spritesheet: "market-select-pagination",
        on: {
            click: () => {
                console.log(">>>");
                ++this.mktCurrentPage;
                this.changeMarketPage();
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });
    this.mktPaginationNext.sprite.setScrollFactor(0);
    this.containers.interface.add(this.mktPaginationNext.sprite);
    this.mktPaginationNext.sprite.flipX = true;

    // adiciona botão de fechar (x)
    this.mktClose = new Button(this, {
        x: 450,
        y: 8,
        spritesheet: "profile-close-btn",
        on: {
            click: () => {
                this.clearMarketInterface();
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });
    this.mktClose.sprite.setScrollFactor(0);
    this.containers.interface.add(this.mktClose.sprite);

    // categoria e página atual
    this.mktCurrentCategory = 0;
    this.mktCurrentPage = 0;

    // processa produtos da página
    this.mktCategoryProducts = _.chunk(this.database.items.market[this.Data.CurrentMap][this.mktCurrentCategory].products, 12);
    this.mktCurrentDisplayProducts = this.mktCategoryProducts[this.mktCurrentPage];

    console.log(this.mktCurrentDisplayProducts);

    //let firstType = this.database.items.market[this.Data.CurrentMap][0].type;
    //console.log("slots", this.database.interface.market.slots.length);
    // adicionar base dos slots
    this.mktSlots = [];
    for (let i = 0; i < this.database.interface.market.slots.length; i ++) {

        let slot = this.database.interface.market.slots[i];

        this.mktSlots[i] = new Button(this, {
                x: slot.x,
                y: slot.y,
                spritesheet: "market-slot-btn",
                on: {
                    click: () => {
                        if (!this.mktCurrentDisplayProducts[i]) {
                            this.mktSlots[i].sprite.input.enabled = false;
                            return;
                        }
                        this.appendMarketConfirmWindow(i);
                    }
                },
                frames: {click: 1, over: 1, up: 1, out: 0}
            });
            this.mktSlots[i].sprite.setScrollFactor(0);
            this.containers.interface.add(this.mktSlots[i].sprite);

        this.containers.interface.add(this.mktSlots[i].sprite);

        if (!this.mktCurrentDisplayProducts[i])
            this.mktSlots[i].sprite.input.enabled = false;
    };

    this.appendMarketSlotElements();
};

Overworld.appendMarketSlotElements = function () {

    this.mktPaginationNext.sprite.input.enabled = !(this.mktCurrentPage + 1 == this.mktCategoryProducts.length);
    this.mktPaginationPrevious.sprite.input.enabled = !(this.mktCurrentPage == 0);

    this.mktSlotsElements = [];

    for (let i = 0; i < this.mktCurrentDisplayProducts.length; i ++) {

        let item = this.mktCurrentDisplayProducts[i];

        this.mktSlots[i].sprite.input.enabled = true;

        this.mktSlotsElements[i] = {};

        this.mktSlotsElements[i].icon = this.add.sprite(0, 0, this.database.items[item].sprite)
            .setScrollFactor(0)
            .setOrigin(0.5)
            .setY(this.mktSlots[i].sprite.getCenter().y - 10);
        this.mktSlotsElements[i].icon.setX(this.mktSlots[i].sprite.x + this.mktSlotsElements[i].icon.displayWidth);
        this.containers.interface.add(this.mktSlotsElements[i].icon);

        this.mktSlotsElements[i].name = this.add.text(0, 0, this.database.items[item].name[this.lang], { 
            fontFamily: "Century Gothic", 
            fontSize: 11, 
            color: "#000" 
        })
            .setScrollFactor(0)
            .setOrigin(0, 0.5)
            .setX(this.mktSlotsElements[i].icon.x + this.mktSlotsElements[i].icon.displayWidth - 5)
            .setY(this.mktSlots[i].sprite.getCenter().y - 10);
        this.containers.interface.add(this.mktSlotsElements[i].name);

        if (this.mktSlotsElements[i].name.text.length > 14) {
            this.mktSlotsElements[i].name.setFontSize(9.5);
            this.mktSlotsElements[i].name.setWordWrapWidth(88);
            this.mktSlotsElements[i].name.setAlign("center");
        };

        let coin = this.database.items[item].price.type == 1 ? "coin-silver" : "coin-gold";
    
        this.mktSlotsElements[i].coin = this.add.sprite(0, 0, coin)
            .setScrollFactor(0)
            .setOrigin(0.5, 0)
            .setX(this.mktSlots[i].sprite.getCenter().x)
            .setY(this.mktSlots[i].sprite.y + 30);

        this.containers.interface.add(this.mktSlotsElements[i].coin);

        this.mktSlotsElements[i].value = this.add.text(0, 0, this.database.items[item].price.amount, { 
            fontFamily: "Century Gothic", 
            fontSize: 11, 
            color: "#000" 
        })
            .setScrollFactor(0)
            .setOrigin(0, 0)
            .setX(this.mktSlotsElements[i].coin.x + this.mktSlotsElements[i].coin.displayWidth - 5)
            .setY(this.mktSlots[i].sprite.y + 30);

        this.containers.interface.add(this.mktSlotsElements[i].value);
    };
};

Overworld.changeMarketPage = function () {

    // limpa elementos dos slots
    this.clearMarketSlotElements();
    // reseta interação com slots
    for (let i = 0; i < this.mktSlots.length; i ++)
        this.mktSlots[i].sprite.input.enabled = false;

    this.mktCurrentDisplayProducts = this.mktCategoryProducts[this.mktCurrentPage];
    this.appendMarketSlotElements();
};

Overworld.marketIncAmount = function () {

    if (this.mktAmountValue == 99)
        return;

    this.mktAmountValue ++;
    this.mktTxtAmount
        .setText(this.mktAmountValue)
        .setX(this.mktAmountBg.getCenter().x)
        .setY(this.mktAmountBg.getCenter().y);
};

Overworld.marketDecAmount = function () {
    if (this.mktAmountValue == 1)
        return;

    this.mktAmountValue --;
    this.mktTxtAmount
        .setText(this.mktAmountValue)
        .setX(this.mktAmountBg.getCenter().x)
        .setY(this.mktAmountBg.getCenter().y);
};

Overworld.appendMarketConfirmWindow = function (index) {

    // caso já tenha uma janela de comprar o item aberta
    if (this.mktWindowOpenned)
        this.clearMarketConfirmWindow();

    const item = this.mktCurrentDisplayProducts[index];

    console.log(this.database.items[item].name.br);

    this.mktWindowOpenned = true;
    this.mktAmountValue = 1;

    this.mktWindowConfirm = this.add.sprite(100, 23, "market-confirm-window")
        .setScrollFactor(0)
        .setOrigin(0, 0)
        .setInteractive();
    this.containers.interface.add(this.mktWindowConfirm);

    this.mktTxtHowMany = this.add.text(0, 0, this.cache.json.get("language").market["howmany"][this.lang],  { 
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#000" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(this.mktWindowConfirm.getCenter().x)
        .setY(43);

    this.containers.interface.add(this.mktTxtHowMany);

    this.mktAmountBg = this.add.sprite(221, 69, "market-amount-bg")
        .setScrollFactor(0)
        .setOrigin(0, 0);
    this.containers.interface.add(this.mktAmountBg);

    this.mktTxtAmount = this.add.text(0, 0, this.mktAmountValue,  { 
        fontFamily: "Century Gothic", 
        fontSize: 22, 
        color: "#000" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(this.mktAmountBg.getCenter().x)
        .setY(this.mktAmountBg.getCenter().y);

    this.containers.interface.add(this.mktTxtAmount);

    this.mktSelectAdd = new Button(this, {
            x: 263,
            y: 75,
            spritesheet: "market-select-amount",
            on: {
                click: () => {
                    this.marketIncAmount();
                }
            },
            frames: {click: 2, over: 1, up: 1, out: 0}
        });
    this.mktSelectAdd.sprite.setScrollFactor(0);
    this.containers.interface.add(this.mktSelectAdd.sprite);

    this.mktSelectDec = new Button(this, {
            x: 263,
            y: 91,
            spritesheet: "market-select-amount",
            on: {
                click: () => {
                    this.marketDecAmount();
                }
            },
            frames: {click: 2, over: 1, up: 1, out: 0}
        });
    this.mktSelectDec.sprite.setScrollFactor(0);
    this.containers.interface.add(this.mktSelectDec.sprite);
    this.mktSelectDec.sprite.flipY = true;

    this.mktBtnConfirm = new Button(this, {
            x: 136,
            y: 113,
            spritesheet: "market-btn-confirm",
            on: {
                click: () => {
                    console.log("LOL");
                    this.requestBuyItem({
                        item_id: item,
                        amount: this.mktAmountValue
                    });
                }
            },
            frames: {click: 2, over: 1, up: 1, out: 0}
        });
    this.mktBtnConfirm.sprite.setScrollFactor(0);
    this.containers.interface.add(this.mktBtnConfirm.sprite);

    this.mktTxtConfirm = this.add.text(0, 0, this.cache.json.get("language").generic["buy"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 13, 
        color: "#fff" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(this.mktBtnConfirm.sprite.getCenter().x)
        .setY(this.mktBtnConfirm.sprite.getCenter().y);

    this.containers.interface.add(this.mktTxtConfirm);

    this.mktBtnReject = new Button(this, {
            x: 249,
            y: 113,
            spritesheet: "market-btn-reject",
            on: {
                click: () => {
                    this.clearMarketConfirmWindow();
                }
            },
            frames: {click: 2, over: 1, up: 1, out: 0}
        });
    this.mktBtnReject.sprite.setScrollFactor(0);
    this.containers.interface.add(this.mktBtnReject.sprite);

    this.mktTxtReject = this.add.text(0, 0, this.cache.json.get("language").generic["cancel"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 13, 
        color: "#fff" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(this.mktBtnReject.sprite.getCenter().x)
        .setY(this.mktBtnReject.sprite.getCenter().y);

    this.containers.interface.add(this.mktTxtReject);
};

Overworld.clearMarketInterface = function () {
    if (this.mktWindowOpenned)
        this.clearMarketConfirmWindow();

    this.mktBg.destroy();
    this.mktTab.destroy();
    this.mktClose.sprite.destroy();
    this.mktPaginationPrevious.sprite.destroy();
    this.mktPaginationNext.sprite.destroy();

    for (let i = 0; i < this.mktTabBtn.length; i++)
        this.mktTabBtn[i].sprite.destroy();

    for (let i = 0; i < this.mktSlots.length; i ++)
        this.mktSlots[i].sprite.destroy();

    this.clearMarketSlotElements();
};

Overworld.clearMarketSlotElements = function () {
    for (let i = 0; i < this.mktSlotsElements.length; i ++) {
        let el = this.mktSlotsElements[i];
        el.icon.destroy();
        el.name.destroy();
        el.coin.destroy();
        el.value.destroy();
    };
};

Overworld.clearMarketConfirmWindow = function () {
    this.mktWindowConfirm.destroy();
    this.mktAmountBg.destroy();
    this.mktTxtHowMany.destroy();
    this.mktTxtAmount.destroy();
    this.mktSelectAdd.sprite.destroy();
    this.mktSelectDec.sprite.destroy();
    this.mktBtnConfirm.sprite.destroy();
    this.mktBtnReject.sprite.destroy();
    this.mktTxtConfirm.destroy();
    this.mktTxtReject.destroy();

    this.mktWindowOpenned = false;
};
 
Overworld.appendPvPInviteBox = function (id, nickname) {

    this.clearInterface();

    this.inviteBox = this.add.sprite(124, 79, "profile-invite-box")
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.containers.interface.add(this.inviteBox);

    this.text.invite = this.add.text(
        0, this.inviteBox.y + 20, 
        ReplacePhrase(this.cache.json.get("language").pvpinvite["invite"][this.lang], {username: nickname}), { 
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#000",
        wordWrap: {
            width: this.inviteBox.displayWidth,
            useAdvancedWrap: true
        }
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(this.inviteBox.getCenter().x);
    this.containers.interface.add(this.text.invite);

    this.btn.accept = new Button(this, {
        x: this.inviteBox.x,
        y: this.inviteBox.y + 39,
        spritesheet: "items-button",
        on: {
            click: () => {
                this.Socket.publish("u-" + id, {
                    action: 4,
                    accept: true
                });

                this.clearInterface();
                this.inviteBox.destroy();
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });

    this.containers.interface.add(this.btn.accept.sprite);
    this.btn.accept.sprite.setScrollFactor(0);

    // this.cache.json.get("language").pvpinvite["accept"][this.lang]

    this.text.accept = this.add.text(
        0, 0, 
        this.cache.json.get("language").pvpinvite["accept"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(this.btn.accept.sprite.getCenter().x)
        .setY(this.btn.accept.sprite.getCenter().y);
    this.containers.interface.add(this.text.accept);


    this.btn.reject = new Button(this, {
        x: this.inviteBox.x + 119,
        y: this.inviteBox.y + 39,
        spritesheet: "items-button",
        on: {
            click: () => {
                this.Socket.publish("u-" + id, {
                    action: 4,
                    accept: false
                });

                this.clearInterface();
                this.inviteBox.destroy();
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });

    this.containers.interface.add(this.btn.reject.sprite);
    this.btn.reject.sprite.setScrollFactor(0);

    this.text.reject = this.add.text(
        0, 0, 
        this.cache.json.get("language").pvpinvite["reject"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(this.btn.reject.sprite.getCenter().x)
        .setY(this.btn.reject.sprite.getCenter().y);
    this.containers.interface.add(this.text.reject);
};

Overworld.appendChatMessages = function () {

    this.clearChatNotification();

    if (this.chatTextArea) {
        this.chatTextArea.setText(this.chatMessages);
        this.chatTextArea.setT(1);
        this.chatTextArea.scrollToBottom();
        this.tweens.add({
            targets: this.chatTextArea,
            ease: "Linear",
            duration: 600,
            alpha: 1,
            onComplete: () => {
                this.chatTextArea.visible = true;
            }
        });
        return;
    };

    const COLOR_PRIMARY = 3426654;
    const COLOR_LIGHT = 2899536;
    const COLOR_DARK = 0x3B536B;

    const height = 75;

    const textArea = this.rexUI.add.textArea({
        x: 240,
        y: 203,
        width: this.sys.game.canvas.width,
        height,

        background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 0, COLOR_PRIMARY),

        // text: this.add.text(),
        text: this.rexUI.add.BBCodeText(),

        // textMask: false,

        slider: {
            track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_DARK),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, COLOR_LIGHT),
        }
    })
        .layout();
        //.drawBounds(this.add.graphics(), 0xff0000);

    textArea.setScrollFactor(0);

    textArea.setText(this.chatMessages);

    textArea.setT(1);

    textArea.scrollToBottom();

    this.chatTextArea = textArea;
};

Overworld.receiveChatMessage = function (data) {

    const message = `\n[b]${data.nickname}[/b]: ${data.message}`;
    this.chatMessages += message;

    if (!this.statusShowingChat && data.nickname != this.player._data.nickname) {
        console.log("Appendou mensagens");
        this.appendChatNotification();
        return;
    };
    // checar se esta no limite
    const scrollThis = this.chatTextArea.t == 1;
    // {message, uid}
    this.chatTextArea.appendText(message);

    // deve scrollar se estiver no "limite" do scroll
    if (scrollThis)
        this.chatTextArea.scrollToBottom();

    // checar se precisa do autoscroll pq tá bugado (inicialmente slider não pode ser
    // setado para scrollar para o bottom)
    if (++this.countChatMessages == 5)
        this.chatTextArea.scrollToBottom();
};

Overworld.appendChatNotification = function () {

    this.newChatNotificationMessages ++;

    if (this.chatNotificationsAppended) {

        if (this.newChatNotificationMessages > 99) {
            this.chatNotificationTxt.setText("+99");
            return;
        };

        this.chatNotificationTxt
            .setText(this.newChatNotificationMessages)
            .setOrigin(0.5, 0.5)
            .setX(this.chatNotificationBg.getCenter().x)
            .setY(this.chatNotificationBg.getCenter().y);
        return;
    };

    this.chatNotificationsAppended = true;

    this.chatNotificationBg = this.add.sprite(
        239,
        16,
        "quest-amount-bg"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);

    this.containers.interface.add(this.chatNotificationBg);

    this.chatNotificationTxt = this.add.text(0, 0, this.newChatNotificationMessages, {
        fontFamily: "Century Gothic", 
        fontSize: 8, 
        color: "#fff" 
    })
        .setOrigin(0.5, 0.5)
        .setScrollFactor(0)
        .setX(this.chatNotificationBg.getCenter().x)
        .setY(this.chatNotificationBg.getCenter().y);
};

Overworld.clearChatNotification = function () {

    if (!this.chatNotificationsAppended)
        return;

    this.newChatNotificationMessages = 0;
    this.chatNotificationsAppended = false;
    this.chatNotificationBg.destroy();
    this.chatNotificationTxt.destroy();
};

// Usar item pergaminho
Overworld.useParchment = function (data) {

    this.interfacesHandler.party.clear(true);

    // verificando se tem move vazio, se tiver não precisa da interface e já usa
    // item diretamente
    for (let i = 0; i < 4; i ++) {
        if (data._monster["move_" + i] == 0) {
            delete data._monster;
            data.position = i;
            this.useItem(data);
            return;
        };
    };
    // appendar interface de escolher move
    this.appendLearnMove({
        move_id: this.database.items[this.selectedItem].move_id,
        monsterData: {
            monsterpedia_id: data._monster.monsterpedia_id,
            moves: [data._monster.move_0, data._monster.move_1, data._monster.move_2, data._monster.move_3]
        }
    }, position => {
        delete data._monster;
        data.position = position;
        this.useItem(data);
    });
};

/*
[x] ver notificações
[x] abrir notificação especifica de move
- abrir notificação especifica de evolução
- abrir notificação especifica de mensagem particular
- requisitar/recusar mudança/aprendizado de move
- requisitar/recusar evolução
*/

Overworld.addNotification = function (data) {

    if (this.notify.data.length == 4)
        this.notify.data.length = 3;
    
    delete data.action;

    this.notify.data.unshift(data);

    this.increaseNotifyBadge();
};

Overworld.appendNotifications = function (data) {

    // se notificações estiver aberta apenas atualiza a lista
    if (this.isNotificationsOppenned) {

        // se não tiver nenhuma notificação sai
        if (!data.data.length) {
            --this.notifyCurrentPage;
            return;
        };

        console.log("123 abc FIXA ABC", data, data.data.length, this.notifyCurrentPage);
        this.clearNotificationElements();
        this.notify = data;
        this.appendNotifyElements();
        return;
    };

    this.isNotificationsOppenned = true;

    console.log("As notificações são essas:");
    console.log(this.notify.data);

    this.notifyCurrentPage = 1;

    this.notifyPopover = this.add.sprite(
        this.database.interface.notify.popover.x,
        this.database.interface.notify.popover.y,
        "notify-popover"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();

    this.containers.interface.add(this.notifyPopover);

    //this.notify.length = 2;

    this.appendNotifyElements();

    this.notifyPaginationLeft = new Button(this, {
        x: this.database.interface.notify.popover.x + 31,
        y: this.database.interface.notify.popover.y + 167,
        spritesheet: "notify-pagination",
        on: {
            click: () => {
                console.log("left");
                --this.notifyCurrentPage;
                if (this.notifyCurrentPage == 1)
                    this.notifyPaginationLeft.sprite.input.enabled = false;

                    this.tweens.add({
                        targets: this.notifyDivs.concat(this.notifyDivText).concat(this.notifyButton),
                        ease: "Linear",
                        duration: 400,
                        alpha: 0,
                        onComplete: () => {
                            this.requestNotificationsData({page: this.notifyCurrentPage});
                        }
                    });
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });
    this.notifyPaginationLeft.sprite.setScrollFactor(0);
    this.containers.interface.add(this.notifyPaginationLeft.sprite);

    this.notifyPaginationRight = new Button(this, {
        x: this.database.interface.notify.popover.x + 62,
        y: this.database.interface.notify.popover.y + 167,
        spritesheet: "notify-pagination",
        on: {
            click: () => {
                this.notifyPaginationLeft.sprite.input.enabled = true;
                ++this.notifyCurrentPage;

                    this.tweens.add({
                        targets: this.notifyDivs.concat(this.notifyDivText).concat(this.notifyButton),
                        ease: "Linear",
                        duration: 400,
                        alpha: 0,
                        onComplete: () => {
                            this.requestNotificationsData({page: this.notifyCurrentPage});
                        }
                    });
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });
    this.notifyPaginationRight.sprite.setScrollFactor(0);
    this.containers.interface.add(this.notifyPaginationRight.sprite);
    this.notifyPaginationRight.sprite.flipX = true;

    if (this.notifyCurrentPage == 1)
        this.notifyPaginationLeft.sprite.input.enabled = false;

        // {x:31 y: 167}
        // {x:62 y: 167}
};

Overworld.appendNotifyElements = function () {
    this.notifyDivs = [];
    this.notifyDivText = [];
    this.notifyButton = [];

    for (let i = 0; i < this.notify.data.length; i ++) {

        this.notifyDivs[i] = this.add.sprite(
            this.database.interface.notify.popover.x + this.database.interface.notify.divs[i].x,
            this.database.interface.notify.popover.y + this.database.interface.notify.divs[i].y,
            "notify-div"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0);

        this.notifyButton[i] = this.add.sprite(
            this.database.interface.notify.popover.x + this.database.interface.notify.buttons[i].x, 
            this.database.interface.notify.popover.y + this.database.interface.notify.buttons[i].y, 
            "tab-party-button"
        )
            .setOrigin(0, 0)
            .setScrollFactor(0)
            .setInteractive({
                useHandCursor: true
            });

        this.notifyButton[i].on("pointerdown", () => {
            console.log("TROLOLOL", this.notify.data[i]);

            // setar na memória que foi visualizada
            if (this.notify.data[i].viewed == 0) {
                this.notify.data[i].viewed = 1;
                this.decreaseNotifyBadge();
            };
            // setar que foi visualizada na db
            this.setNotificationSeen({id: this.notify.data[i].id});

            // add loader de carregamento
            this.addLoader();

            switch (this.notify.data[i].type) {
                case 1: {
                    this.requestMoveNotification(this.notify.data[i].n_id);
                    break;
                };

                case 2: {
                    this.requestEvolveNotification(this.notify.data[i].n_id);
                    break;
                };

                case 3: {
                    this.requestNegotiationNotification(this.notify.data[i].n_id);
                    break;
                };
            };
            
        });

        this.notifyButton[i].displayWidth = 104;
        this.notifyButton[i].displayHeight = 35;
        this.containers.interface.add(this.notifyDivs[i]);
        this.containers.interface.add(this.notifyButton[i]);

        let type;

        switch (this.notify.data[i].type) {
            case 1: {
                type = "learnmove";
                break;
            };

            case 2: {
                type = "evolve";
                break;
            };

            case 3: {
                type = "marketplace";
                break;
            };
        };

        this.notifyDivText[i] = this.add.text(0, 0, this.cache.json.get("language").notify[type][this.lang], {
            fontFamily: "Century Gothic", 
            fontSize: 10, 
            color: "#000",
            wordWrap: {
                width: this.notifyPopover.displayWidth,
                useAdvancedWrap: true
            }
        })
            .setScrollFactor(0)
            .setOrigin(0.5)
            .setX(this.notifyButton[i].getCenter().x)
            .setY(this.notifyButton[i].getCenter().y);
        this.containers.interface.add(this.notifyDivText[i]);
    };
};

Overworld.clearNotifications = function () {
    this.notifyPopover.destroy();
    this.notifyPaginationLeft.sprite.destroy();
    this.notifyPaginationRight.sprite.destroy();

    this.clearNotificationElements();

    this.isNotificationsOppenned = false;
};

Overworld.clearNotificationElements = function () {
    for (let i = 0; i < this.notify.data.length; i ++) {
        this.notifyDivs[i].destroy();
        this.notifyDivText[i].destroy();
        this.notifyButton[i].destroy();
    };
};

Overworld.appendNotificationBadge = function () {
    this.notifyBadge = this.add.sprite(
        330,
        20,
        "quest-amount-bg"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.containers.interface.add(this.notifyBadge);

    const notifyBagdeCenter = this.notifyBadge.getCenter();

    this.notifyBadgeText = this.add.text(notifyBagdeCenter.x, notifyBagdeCenter.y, this.notify.count, {
        fontFamily: "Century Gothic", 
        fontSize: 8, 
        color: "#fff" 
    })
        .setOrigin(0.5)
        .setScrollFactor(0);

    this.containers.interface.add(this.notifyBadgeText);
};

Overworld.increaseNotifyBadge = function () {
    if (this.notify.count == 0) {
        this.appendNotificationBadge();
    };

    this.notify.count ++;
    const notifyBagdeCenter = this.notifyBadge.getCenter();
    this.notifyBadgeText
        .setText(this.notify.count)
        .setOrigin(0.5)
        .setX(notifyBagdeCenter.x)
        .setY(notifyBagdeCenter.y);
};

Overworld.decreaseNotifyBadge = function () {
    this.notify.count --;

    if (this.notify.count == 0) {
        this.notifyBadge.destroy();
        this.notifyBadgeText.destroy();
        return;
    };

    const notifyBagdeCenter = this.notifyBadge.getCenter();
    this.notifyBadgeText
        .setText(this.notify.count)
        .setOrigin(0.5)
        .setX(notifyBagdeCenter.x)
        .setY(notifyBagdeCenter.y);
};

Overworld.appendMoveNotification = function (data) {

    // remove loader
    this.removeLoader();
    console.log(data, "HELLOUUU HEXA");
    // -> resposta: 90

    this.moveNotifyInterfaceType = 0;

    this.moveNotificationBg = this.add.sprite(
        0,
        0,
        "notify-background"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();
    this.containers.interface.add(this.moveNotificationBg);

    let monster = this.database.monsters[data.monsterData.monsterpedia_id];

    this.notifyMonsterSprite = this.add.sprite(
        this.moveNotificationBg.getCenter().x,
        this.moveNotificationBg.getCenter().y,
        "monster_" + data.monsterData.monsterpedia_id
    )
        .setOrigin(0.5)
        .setScrollFactor(0);

    this.addMonsterAnimations(data.monsterData.monsterpedia_id, this.notifyMonsterSprite);
    this.containers.interface.add(this.notifyMonsterSprite);

    this.moveNotifyClose = new Button(this, {
        x: 461,
        y: 6,
        spritesheet: "profile-close-btn",
        on: {
            click: () => {
                this.clearMoveNotification();
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });
    this.moveNotifyClose.sprite.setScrollFactor(0);
    this.containers.interface.add(this.moveNotifyClose.sprite);
    
    if (data.used) {
        this.moveNotifyInterfaceType = 1;

        this.moveNotificationTxt = this.add.text(0, 0, ReplacePhrase(this.cache.json.get("language").notify["innotifyalreadylearnedmove"][this.lang], {monster: monster.name, move: this.database.moves[data.move_id].name[this.lang]}), { 
            fontFamily: "Century Gothic", 
            fontSize: 18, 
            color: "#fff",
            wordWrap: {
                width: this.moveNotificationBg.displayWidth - 50,
                useAdvancedWrap: true
            },
            padding: {
                top: 5,
                left: 5,
                right: 5
            }
        })
            .setScrollFactor(0)
            .setOrigin(0.5, 0)
            .setX(this.moveNotificationBg.getCenter().x);
        this.containers.interface.add(this.moveNotificationTxt);

        return;
    };

    ///this.cache.json.get("language").generic["yes"][this.lang]

    this.moveNotificationTxt = this.add.text(0, 0, ReplacePhrase(this.cache.json.get("language").notify["innotifylearnmove"][this.lang], {monster: monster.name, move: this.database.moves[data.move_id].name[this.lang]}), { 
        fontFamily: "Century Gothic", 
        fontSize: 18, 
        color: "#fff",
        wordWrap: {
            width: this.moveNotificationBg.displayWidth - 50,
            useAdvancedWrap: true
        },
        padding: {
            top: 5,
            left: 5,
            right: 5
        }
    })
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(this.moveNotificationBg.getCenter().x);
    this.containers.interface.add(this.moveNotificationTxt);

    this.buttonLearn = new Button(this, {
        x: 93,
        y: 191,
        spritesheet: "learn-btn",
        on: {
            click: () => {
                console.log("LOL");
                this.clearMoveNotification();
                this.appendLearnMove(data, position => {
                    console.log("lol position foi", position);

                    this.requestChangeMoveByNotification({
                        n_id: data.id,
                        position
                    });
                });
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    this.buttonLearn.sprite.setScrollFactor(0);
    this.containers.interface.add(this.buttonLearn.sprite);

    this.textLearn = this.add.text(
        0, 
        0, 
        "Ensinar ataque", 
        {
            fontFamily: "Century Gothic", 
            fontSize: 16, 
            color: "#fff"
        }
    )
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(this.buttonLearn.sprite.getCenter().x)
        .setY(this.buttonLearn.sprite.getCenter().y);

    this.buttonDontLearn = new Button(this, {
        x: 249,
        y: 191,
        spritesheet: "learn-btn",
        on: {
            click: () => {
                console.log("LOLabc");
                this.requestDontLearnMove({
                    n_id: data.id
                });
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    this.buttonDontLearn.sprite.setScrollFactor(0);
    this.containers.interface.add(this.buttonDontLearn.sprite);

    this.textDontLearn = this.add.text(
        0, 
        0, 
        "Não ensinar ataque", 
        {
            fontFamily: "Century Gothic", 
            fontSize: 16, 
            color: "#fff",
            wordWrap: {
                width: this.buttonDontLearn.sprite.displayWidth,
                useAdvancedWrap: true
            },
            align: "center"
        }
    )
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(this.buttonDontLearn.sprite.getCenter().x)
        .setY(this.buttonDontLearn.sprite.getCenter().y);
};

Overworld.clearMoveNotification = function () {
    this.moveNotificationBg.destroy();
    this.moveNotificationTxt.destroy();
    if (this.moveNotifyInterfaceType == 0) {
        this.buttonLearn.sprite.destroy();
        this.textLearn.destroy();
        this.buttonDontLearn.sprite.destroy();
        this.textDontLearn.destroy();
    };
    this.notifyMonsterSprite.destroy();
    this.moveNotifyClose.sprite.destroy();

    this.moveNotifyInterfaceType = null;
};

Overworld.appendEvolveNotification = function (data) {

    console.log(data, "riariaria");

    // remove loader
    this.removeLoader();

    this.evolveNotifyInterfaceType = 0;

    this.evolveNotificationBg = this.add.sprite(
        0,
        0,
        "notify-background"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();
    this.containers.interface.add(this.evolveNotificationBg);

    this.evolveNotifyClose = new Button(this, {
        x: 461,
        y: 6,
        spritesheet: "profile-close-btn",
        on: {
            click: () => {
                this.clearEvolveNotification();
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });
    this.evolveNotifyClose.sprite.setScrollFactor(0);
    this.containers.interface.add(this.evolveNotifyClose.sprite);


    let monster = this.database.monsters[data.monsterData.monsterpedia_id],
        evolveMonster = this.database.monsters[data.evolve_to];

    this.notifyMonsterSprite = this.add.sprite(
        this.evolveNotificationBg.getCenter().x,
        this.evolveNotificationBg.getCenter().y,
        "monster_" + data.monsterData.monsterpedia_id
    )
        .setOrigin(0.5)
        .setScrollFactor(0);

    this.addMonsterAnimations(data.monsterData.monsterpedia_id, this.notifyMonsterSprite);
    this.containers.interface.add(this.notifyMonsterSprite);

    if (data.used) {
        console.log(`A ação de evolução já foi utilizada.`);
        this.evolveNotifyInterfaceType = 1;

        this.evolveNotificationTxt = this.add.text(0, 0, this.cache.json.get("language").notify["innotifyalreadyevolved"][this.lang], { 
            fontFamily: "Century Gothic", 
            fontSize: 18, 
            color: "#fff",
            wordWrap: {
                width: this.evolveNotificationBg.displayWidth - 50,
                useAdvancedWrap: true
            },
            padding: {
                top: 5,
                left: 5,
                right: 5
            }
        })
            .setScrollFactor(0)
            .setOrigin(0.5, 0)
            .setX(this.evolveNotificationBg.getCenter().x);
        this.containers.interface.add(this.evolveNotificationTxt);
        return;
    };

    this.evolveNotificationTxt = this.add.text(0, 0, ReplacePhrase(this.cache.json.get("language").notify["innotifyevolve"][this.lang], {monster: monster.name, evolve: evolveMonster.name}), { 
        fontFamily: "Century Gothic", 
        fontSize: 18, 
        color: "#fff",
        wordWrap: {
            width: this.evolveNotificationBg.displayWidth - 50,
            useAdvancedWrap: true
        },
        padding: {
            top: 5,
            left: 5,
            right: 5
        }
    })
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(this.evolveNotificationBg.getCenter().x);
    this.containers.interface.add(this.evolveNotificationTxt);

    this.buttonEvolve = new Button(this, {
        x: 171,
        y: 194,
        spritesheet: "learn-btn",
        on: {
            click: () => {
                console.log("LOL");
                this.requestEvolveByNotification({
                    n_id: data.id
                });
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    this.buttonEvolve.sprite.setScrollFactor(0);
    this.containers.interface.add(this.buttonEvolve.sprite);

    this.textEvolve = this.add.text(
        0, 
        0, 
        "Evoluir", 
        {
            fontFamily: "Century Gothic", 
            fontSize: 16, 
            color: "#fff"
        }
    )
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(this.buttonEvolve.sprite.getCenter().x)
        .setY(this.buttonEvolve.sprite.getCenter().y);


    console.log(`O monstro ${monster.name} vai evoluir para ${evolveMonster.name}, deseja prosseguir?`);
};

Overworld.clearEvolveNotification = function () {
    this.evolveNotificationBg.destroy();
    this.evolveNotifyClose.sprite.destroy();
    this.notifyMonsterSprite.destroy();
    this.evolveNotificationTxt.destroy();

    if (this.evolveNotifyInterfaceType == 0) {
        this.buttonEvolve.sprite.destroy();
        this.textEvolve.destroy();
    };

    this.evolveNotifyInterfaceType = null;
};

Overworld.appendMarketPlaceNotification = function (data) {
    // remove loader
    this.removeLoader();
    console.log(data, "HELLOUUU HEXA");
    // -> resposta: 90

    this.marketplaceNotificationBg = this.add.sprite(
        0,
        0,
        "notify-background"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();
    this.containers.interface.add(this.marketplaceNotificationBg);

    this.marketplaceNotifyClose = new Button(this, {
        x: 461,
        y: 6,
        spritesheet: "profile-close-btn",
        on: {
            click: () => this.clearMarketPlaceNotification()
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });
    this.marketplaceNotifyClose.sprite.setScrollFactor(0);
    this.containers.interface.add(this.marketplaceNotifyClose.sprite);

    let text;

    switch(data.item_or_monster) {
        case 0: {
            text = ReplacePhrase(this.cache.json.get("language").notify["innotifyitemnegotiated"][this.lang], {item: this.database.items[data.solded].name[this.lang]});
            break;
        };

        case 1: {
            text = ReplacePhrase(this.cache.json.get("language").notify["innotifymonsternegotiated"][this.lang], {monster: this.database.monsters[data.solded].name});
            break;
        };

    };

    this.marketplaceNotificationTxt = this.add.text(0, 0, text, { 
        fontFamily: "Century Gothic", 
        fontSize: 22, 
        color: "#fff",
        wordWrap: {
            width: this.marketplaceNotificationBg.displayWidth - 50,
            useAdvancedWrap: true
        },
        padding: {
            top: 5,
            left: 5,
            right: 5
        }
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(this.marketplaceNotificationBg.getCenter().x)
        .setY(this.marketplaceNotificationBg.getCenter().y);
    this.containers.interface.add(this.marketplaceNotificationTxt);
};

Overworld.clearMarketPlaceNotification = function () {
    this.marketplaceNotificationBg.destroy();
    this.marketplaceNotificationTxt.destroy();
    this.marketplaceNotifyClose.sprite.destroy();
};

Overworld.appendLearnMove = function (data, callback) {
    this.learnMoveBg = this.add.sprite(
        0,
        0,
        "notify-background"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();

    this.containers.interface.add(this.learnMoveBg);

    this.learnMoveClose = new Button(this, {
        x: 461,
        y: 6,
        spritesheet: "profile-close-btn",
        on: {
            click: () => {
                this.clearLearnMove();
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });
    this.learnMoveClose.sprite.setScrollFactor(0);
    this.containers.interface.add(this.learnMoveClose.sprite);

    this.learnMoveInfoBtn = new Button(this, {
        x: 10,
        y: 191,
        spritesheet: "info-button",
        on: {
            click: () => {
                console.log(data);
                this.clearMoveWindow();
                this.appendMoveWindowInfo(this.database.moves[data.move_id]);
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    this.learnMoveInfoBtn.sprite.setScrollFactor(0);
    this.containers.interface.add(this.learnMoveInfoBtn.sprite);

    this.learnMoveText = this.add.text(19, 22, ReplacePhrase(this.cache.json.get("language").learnmove["wanttoreplace"][this.lang], {move: this.database.moves[data.move_id].name[this.lang]}), {
        fontFamily: "Century Gothic", 
        fontSize: 18, 
        color: "#fff",
        wordWrap: {
            width: 267,
            useAdvancedWrap: true
        }
    })
        .setScrollFactor(0)
        .setOrigin(0, 0);
    this.containers.interface.add(this.learnMoveText);

    this.learnMoveMonsterSprite = this.add.sprite(
        111,
        108,
        "monster_" + data.monsterData.monsterpedia_id
    )
        .setX(this.learnMoveText.getCenter().x)
        .setScrollFactor(0)
        .setOrigin(0.5, 0);

    this.addMonsterAnimations(data.monsterData.monsterpedia_id, this.learnMoveMonsterSprite);
    this.containers.interface.add(this.learnMoveMonsterSprite);

    this.learnMovesBtn = [];
    this.learnMovesTxt = [];

    for (let i = 0; i < 4; i ++) {

        this.learnMovesBtn[i] = new Button(this, {
            x: this.database.interface.learnmove.buttons[i].x,
            y: this.database.interface.learnmove.buttons[i].y,
            spritesheet: "learn-btn",
            on: {
                click: () => {
                    callback(i);
                    //console.log(this.database.moves[data.monsterData.moves[i]].name[this.lang]);
                }
            },
            frames: {click: 1, over: 2, up: 0, out: 0}
        });
        this.learnMovesBtn[i].sprite.setScrollFactor(0);
        this.containers.interface.add(this.learnMovesBtn[i].sprite);

        this.learnMovesTxt[i] = this.add.text(0, 0, this.database.moves[data.monsterData.moves[i]].name[this.lang], { 
            fontFamily: "Century Gothic", 
            fontSize: 14, 
            color: "#fff" 
        })
            .setOrigin(0.5)
            .setX(this.learnMovesBtn[i].sprite.getCenter().x)
            .setY(this.learnMovesBtn[i].sprite.getCenter().y)
            .setScrollFactor(0);

        this.containers.interface.add(this.learnMovesTxt[i]);
    };
};

Overworld.clearLearnMove = function () {
    this.learnMoveClose.sprite.destroy();
    this.learnMoveBg.destroy();
    this.learnMoveInfoBtn.sprite.destroy();
    this.learnMoveText.destroy();
    this.learnMoveMonsterSprite.destroy();
    for (let i = 0; i < 4; i ++) {
        this.learnMovesBtn[i].sprite.destroy();
        this.learnMovesTxt[i].destroy();
    };
};

// Janela de informações do move
Overworld.appendMoveWindowInfo = function (move) {

    this.isMoveWindowOppened = true;

    this.moveWindow = this.add.sprite(
        76,
        58,
        "party-move-window"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();

    this.containers.interface.add(this.moveWindow);

    this.moveWindowTitle = this.add.text(this.moveWindow.x + 10, this.moveWindow.y + 2, "Descrição", {
        fontFamily: "Century Gothic", 
        fontSize: 19, 
        color: "#000"
    })
        .setScrollFactor(0)
        .setOrigin(0.5, 0)
        .setX(this.moveWindow.getCenter().x);

    this.moveWindowDesc = this.add.text(this.moveWindow.x + 10, this.moveWindow.y + 22, move.desc[this.lang], {
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#000",
        wordWrap: {
            width: this.moveWindow.displayWidth - 15,
            useAdvancedWrap: true
        }
    })
        .setScrollFactor(0);

    this.containers.interface.add(this.moveWindowDesc);

    this.moveWindowClose = new Button(this, {
        x: 380,
        y: 63,
        spritesheet: "profile-close-btn",
        on: {
            click: () => this.clearMoveWindow()
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });

    this.moveWindowClose.sprite.setScrollFactor(0);
    this.containers.interface.add(this.moveWindowClose.sprite);
};

// Limpar janela de info do move
Overworld.clearMoveWindow = function () {
    if (!this.isMoveWindowOppened)
        return;

    this.moveWindow.destroy();
    this.moveWindowTitle.destroy();
    this.moveWindowDesc.destroy();
    this.moveWindowClose.sprite.destroy();

    this.isMoveWindowOppened = false;
};

// Carregar sprite do monstro em assincronia
Overworld.loadMonsterSprite = function (id, callback) {
    this.load.once("complete", callback, this);

    this.load.atlas("monster_" + (id), "/assets/img/monsters/" + (id) + ".png", "/assets/res/monster_" + (id) + ".json");

    this.load.start();
};

// Adicionar animações do monstro
Overworld.addMonsterAnimations = function (id, sprite) {

    const 
        name = this.database.monsters[id].name,
        frames = [];

    for (let i = 0; i < this.database.battle.sprites[id].animation.idle; i++)
        frames[i] = {
            key: this.database.battle.sprites[id].atlas,
            frame: name.toLowerCase() + "_idle" + (i)
        };

    this.anims.create({
        key: name.toLowerCase() + "_idle",
        frames,
        frameRate: 7,
        repeat: -1
    });

    sprite.anims.load(name.toLowerCase() + "_idle");
    sprite.anims.play(name.toLowerCase() + "_idle");
};

Overworld.testColl = function (position) {
    // pega informação dos tiles para executar colisão
    const 
        tileY = this.collisionLayer.data[position.y] ? this.collisionLayer.data[position.y] : 0,
        tileX = tileY[position.x] ? tileY[position.x] : 0,
        tilesXY = tileY ? this.database.overworld.tile.properties[tileX.index] : 0;

    // se for tile limite, bloqueio, ou existir algum objeto no lugar
    if (!tileY || !tileX || !tilesXY || tilesXY.block || this.mapObjectPosition[position.x + "|" + position.y])
        return 0;

    // ** daqui pra baixo pode executar em assincronia

    // solicita mudar de mapa
    if (tilesXY.door)
        return 3;

    // solicita luta selvagem
    if (tilesXY.wild)
        return 4;

    // tile de evento
    if (tilesXY.event)
        return 7;

    // ok, pode andar
    return 1;
};

Overworld.addLoader = function () {

    this._load = new Loading(this);

    this._overlay = this.add.sprite(0, 0, "tab-party-button")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();

    this._overlay.displayWidth = 480;
    this._overlay.displayHeight = 240;

    this.interactionButtonEnabled = false;
};

Overworld.removeLoader = function () {
    if (this._load && this._overlay) {
        this._load.destroy();
        this._overlay.destroy();
        this._load = null;
        this._overlay = null;
        this.interactionButtonEnabled = true;
    };
};

Overworld.appendInitialMonsterMenu = function (variable, callback) {

    const
        bg = [],
        btn = [],
        name = [],
        mons = [];

    this.dynamicInterface = { bg, btn, name, mons };

    bg[0] = this.add.sprite(0, 19, "initial-main-bg")
        .setOrigin(0, 0)
        .setScrollFactor(0);
    this.containers.interface.add(bg[0]);

    btn[0] = new Button(this, {
        x: 2,
        y: 35,
        spritesheet: "initial-select-btn",
        on: {
            click: () => {
                this.appendConfirmInitialMonster(1, variable, callback);
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });
    btn[0].sprite.setScrollFactor(0);
    this.containers.interface.add(btn[0].sprite);
    name[0] = this.add.text(0, 0, this.database.monsters[1].name, { 
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(btn[0].sprite.getCenter().x)
        .setY(btn[0].sprite.y + btn[0].sprite.displayHeight - 10);
    this.containers.interface.add(name[0]);

    btn[1] = new Button(this, {
        x: 164,
        y: 35,
        spritesheet: "initial-select-btn",
        on: {
            click: () => {
                this.appendConfirmInitialMonster(4, variable, callback);
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });
    btn[1].sprite.setScrollFactor(0);
    this.containers.interface.add(btn[1].sprite);
    name[1] = this.add.text(0, 0, this.database.monsters[4].name, { 
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(btn[1].sprite.getCenter().x)
        .setY(btn[1].sprite.y + btn[1].sprite.displayHeight - 10);
    this.containers.interface.add(name[1]);

    btn[2] = new Button(this, {
        x: 326,
        y: 35,
        spritesheet: "initial-select-btn",
        on: {
            click: () => {
                this.appendConfirmInitialMonster(7, variable, callback);
            }
        },
        frames: {click: 2, over: 1, up: 0, out: 0}
    });
    btn[2].sprite.setScrollFactor(0);
    this.containers.interface.add(btn[2].sprite);
    name[2] = this.add.text(0, 0, this.database.monsters[7].name, {
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(btn[2].sprite.getCenter().x)
        .setY(btn[2].sprite.y + btn[2].sprite.displayHeight - 10);
    this.containers.interface.add(name[2]);

    mons[0] = this.add.sprite(
        btn[0].sprite.getCenter().x,
        btn[0].sprite.getCenter().y,
        "monster_1"
    )
        .setOrigin(0.5)
        .setScrollFactor(0);

    this.containers.interface.add(mons[0]);
    this.addMonsterAnimations(1, mons[0]);

    mons[1] = this.add.sprite(
        btn[1].sprite.getCenter().x,
        btn[1].sprite.getCenter().y,
        "monster_4"
    )
        .setOrigin(0.5)
        .setScrollFactor(0);

    this.containers.interface.add(mons[1]);
    this.addMonsterAnimations(4, mons[1]);

    mons[2] = this.add.sprite(
        btn[2].sprite.getCenter().x,
        btn[2].sprite.getCenter().y,
        "monster_7"
    )
        .setOrigin(0.5)
        .setScrollFactor(0);

    this.containers.interface.add(mons[2]);
    this.addMonsterAnimations(7, mons[2]);
};

Overworld.appendConfirmInitialMonster = function (id, variable, callback) {

    const 
        btn2 = [],
        options = [];

    this.dynamicInterface.btn2 = btn2;
    this.dynamicInterface.options = options;

    for (let i = 0; i < this.dynamicInterface.btn.length; i ++)
        this.dynamicInterface.btn[i].sprite.input.enabled = false;
    
    this.dynamicInterface.bg[1] = this.add.sprite(86, 77, "initial-box-bg")
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setInteractive();
    this.containers.interface.add(this.dynamicInterface.bg[1]);

    btn2[0] = new Button(this, {
        x: 93,
        y: 120,
        spritesheet: "initial-btn-accept",
        on: {
            click: () => {

                //console.log(id, this.database.monsters[id].name);
                this.dynamicVariables[variable] = id;

                for (let i = 0; i < this.dynamicInterface.bg.length; i ++)
                    this.dynamicInterface.bg[i].destroy();

                for (let i = 0; i < this.dynamicInterface.btn.length; i ++)
                    this.dynamicInterface.btn[i].sprite.destroy();

                for (let i = 0; i < this.dynamicInterface.btn2.length; i ++)
                    this.dynamicInterface.btn2[i].sprite.destroy();

                for (let i = 0; i < this.dynamicInterface.name.length; i ++)
                    this.dynamicInterface.name[i].destroy();

                for (let i = 0; i < this.dynamicInterface.mons.length; i ++)
                    this.dynamicInterface.mons[i].destroy();

                for (let i = 0; i < this.dynamicInterface.options.length; i ++)
                    this.dynamicInterface.options[i].destroy();

                callback();
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    btn2[0].sprite.setScrollFactor(0);
    this.containers.interface.add(btn2[0].sprite);
    options[0] = this.add.text(0, 0, this.cache.json.get("language").generic["yes"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#000" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(btn2[0].sprite.getCenter().x)
        .setY(btn2[0].sprite.getCenter().y);
    this.containers.interface.add(options[0]);

    btn2[1] = new Button(this, {
        x: 250,
        y: 120,
        spritesheet: "initial-btn-reject",
        on: {
            click: () => {
                for (let i = 0; i < this.dynamicInterface.btn.length; i ++)
                    this.dynamicInterface.btn[i].sprite.input.enabled = true;
                this.dynamicInterface.bg[1].destroy();
                btn2[0].sprite.destroy();
                btn2[1].sprite.destroy();
                options[0].destroy();
                options[1].destroy();
                options[2].destroy();
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    btn2[1].sprite.setScrollFactor(0);
    this.containers.interface.add(btn2[1].sprite);
    options[1] = this.add.text(0, 0, this.cache.json.get("language").generic["no"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#000" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(btn2[1].sprite.getCenter().x)
        .setY(btn2[1].sprite.getCenter().y);
    this.containers.interface.add(options[1]);

    options[2] = this.add.text(0, 0, ReplacePhrase(this.cache.json.get("language").initialmonster["areyousure"][this.lang], {monster: this.database.monsters[id].name}), { 
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    })
        .setScrollFactor(0)
        .setOrigin(0.5)
        .setX(this.dynamicInterface.bg[1].getCenter().x)
        .setY(this.dynamicInterface.bg[1].getCenter().y - 20);
    this.containers.interface.add(options[2]);
};

export default Overworld;