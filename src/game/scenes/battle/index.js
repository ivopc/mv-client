import Phaser from "phaser";
import async from "async";

// Interfaces
import Party from "@/game/interfaces/party";

// Libs próprias
import Button from "@/game/plugins/button";
import PointsBar from "@/game/plugins/pointsbar";
import isMobile from "@/game/plugins/checkmobile";

const Battle = {};

Battle.Extends = Phaser.Scene;

Battle.initialize = function () {
    Phaser.Scene.call(this, {key: "battle"});
};

Battle.init = function (data) {
    // transportando escopo

    // dependencias primárias
    this.Data = data.data;
    this.Socket = data.socket;

    // autenticação
    this.auth = data.auth;

    this.player = {};
    //player data
    this.player._data = data.player;

    this.flag = data.flag;
    this.tamers = data.tamers;

    // parâmetros
    this.battleParams = data.param;
    console.log("lolabc", data.param);

    // gerenciador
    this.manager = data.manager;

    this.objectPositions = data.objectPositions;

    this.containers = {};

    this.lang = "br";

    this.isMobile = isMobile;
};

Battle.preload = function () {

    this.database = this.cache.json.get("database");

    this.load.setBaseURL(process.env.gameClientBaseURL);

    const bg = this.add.sprite(
        0,
        0,
        "load_background"
    ).setOrigin(0, 0);
    
    bg.displayWidth = 480;
    bg.scaleY = 0.25;

    const 
        width = this.cameras.main.width,
        height = this.cameras.main.height;

    const percentText = this.add.text(width / 2, height / 2 - 5, "0%", {
        fontFamily: "monospace",
        fontSize: 18,
        color: "#fff"
    });
    percentText.setOrigin(0.5, 0.5);

    const percentBar = new PointsBar(this, {x: 182, y: 132, width: 114, height: 6, bar: {color: 15528177}});
    percentBar.setPercentDirectly(0);

    this.load.on("progress", value => {
        let val = parseInt(value * 100);
        try {
            percentText.setText(val + "%");
            percentBar.setPercent(val);
        } catch (e) {
            //console.log("lol", e);
        };
    });

    this.load.on("complete", () => {
        bg.destroy();
        percentText.destroy();
        percentBar.destroy();
    });

    // carregar monstros do jogador
    for (let i = 0; i < 6; i++) {
        let monster = this.battleParams.playerMonsters["monster" + (i)];
        if (monster) {
            this.load.atlas("monster_" + (monster.monsterpedia_id), "assets/img/monsters/" + monster.monsterpedia_id + ".png", "assets/res/monster_" + (monster.monsterpedia_id) + ".json");
            this.load.atlas("monster_" + (monster.monsterpedia_id) + "_overworld", "assets/img/monsters/overworld/" + (monster.monsterpedia_id) + ".png", "assets/res/monster_" + (monster.monsterpedia_id) + "_overworld.json");
        };
    };

    // vendo qual o tipo de batalha, para carregar monstros do bot/cpu
    switch (+this.battleParams.battleInfo.battle_type) {
        // caso seja selvagem, carregar um único monstro
        case 1: {
            // carregar monstro selvagem
            let wild = this.battleParams.wild;
            this.load.atlas("monster_" + (wild.monsterpedia_id), "assets/img/monsters/" + wild.monsterpedia_id + ".png", "assets/res/monster_" + (wild.monsterpedia_id) + ".json");

            break;
        };
        // caso seja contra domador (bot/cpu)
        case 2: {
            // carregar monstros do bot/cpu
            for (let i = 0; i < 6; i++) {
                let monster = this.battleParams.tamerMonsters["monster" + (i)];
                if (monster) 
                    this.load.atlas("monster_" + (monster.monsterpedia_id), "assets/img/monsters/" + monster.monsterpedia_id + ".png", "assets/res/monster_" + (monster.monsterpedia_id) + ".json");
            };

            break;
        };

        // caso seja PvP
        case 3: {
            for (let i = 0; i < 6; i++) {
                let monster = this.battleParams.opponentPlayerMonsters["monster" + (i)];

                if (monster) {
                    this.load.atlas("monster_" + (monster.monsterpedia_id), "assets/img/monsters/" + monster.monsterpedia_id + ".png", "assets/res/monster_" + (monster.monsterpedia_id) + ".json");
                };
            };

            break;
        };
    };

    // "cacheando" categoria do campo
    let field_category;

    // vendo qual categoria deve ser definida
    switch (+this.battleParams.battleInfo.field_category) {
        // caso a categoria do campo de batalha seja grama (grass)
        case 1: {
            field_category = "grass";
            break;
        };
    };

    // miscellaneous
    // botão de ações // frames: 0 = normal | 1 = click | 2 = hover
    this.load.spritesheet("button_new", "assets/img/battle/button_spritesheet.png", {frameWidth: 105, frameHeight: 38});
    // botão de voltar
    this.load.spritesheet("button_back", "assets/img/battle/back_spritesheet.png", {frameWidth: 38, frameHeight: 40});

    this.load.image("magic-seal", "assets/img/items/1.png");
    this.load.image("super-potion", "assets/img/items/6.png");
    this.load.image("antidote", "assets/img/items/10.png");
    this.load.image("parchment", "assets/img/items/25.png");

    // party
    this.load.image("party-background", "assets/img/party/background.png");
    this.load.spritesheet("party-slot", "assets/img/party/slotsheet.png", {frameWidth: 148, frameHeight: 39});
    this.load.spritesheet("party-tooltip", "assets/img/party/tooltip_spritesheet.png", {frameWidth: 220, frameHeight: 50});
    this.load.image("tab-party-button", "assets/img/party/tabpartybutton.png");
    this.load.spritesheet("gender", "assets/img/party/gen.png", {frameWidth: 11, frameHeight: 11});
    // specific-party
    this.load.image("party-info", "assets/img/party/info2.png");
    this.load.image("party-stats", "assets/img/party/statistics.png");
    this.load.image("party-moves", "assets/img/party/moves2.png");
    this.load.image("party-hud", "assets/img/party/hud.png");
    this.load.image("party-move-button", "assets/img/party/move-btn.png");
    this.load.image("party-move-window", "assets/img/party/move-window.png");
    // itens
    this.load.image("items-background", "assets/img/items/itens/background.png");
    this.load.image("items-window-box", "assets/img/items/itens/ui-itens-box.png");
    this.load.spritesheet("items-button", "assets/img/items/itens/ui-itens-btn.png", {frameWidth: 113, frameHeight: 42});
    this.load.image("items-close-btn", "assets/img/items/itens/ui-itens-close-btn.png");
    this.load.spritesheet("profile-close-btn", "assets/img/profile/close-btn.png", {frameWidth: 14, frameHeight: 14});
    // ui
    this.load.atlas("icons", "assets/img/interface/icons.png", "assets/res/icons.json");
    this.load.atlas("types", "assets/img/interface/types.png", "assets/res/types.json");
    this.load.atlas("status-problem", "assets/img/interface/status_problem.png", "assets/res/status_problem.json");

    this.load.image("character_battle", "assets/img/characters/CharacterBattle.png");
    this.load.image("hud", "assets/img/battle/hud_info.png");
    this.load.image("opponent_hud", "assets/img/battle/hud_opponent_info.png");
    this.load.image("box_new", "assets/img/battle/box.png");
    this.load.spritesheet("hourglass-icon", "assets/img/interface/hourglass.png", {frameWidth: 32, frameHeight: 32});

    this.load.audio("wild_battle", "assets/audio/Wild Monster Battle.wav");

    // efeitos da batalha
    this.load.image("rain", "assets/img/rain.png");
    this.load.spritesheet("plasmaball", "assets/img/battle/plasmaball.png", {frameWidth: 128, frameHeight: 128});
    this.load.spritesheet("firesheet", "assets/img/battle/firesheet.png", {frameWidth: 128, frameHeight: 128});
    this.load.atlas("flares", "assets/img/battle/flares.png", "assets/res/battle-flares.json");
    // carregar resources do campo de batalha
    this.load.image("presentation", "assets/img/battle/" + field_category + "_presentation.png");
    this.load.image("floor", "assets/img/battle/" + field_category + "_floor.png");
    this.load.image("background", "assets/img/battle/" + field_category + "_background.png");
    

    //this.load.audio("wild", "assets/audio/wild_battle.mp3");
    //this.load.audio("beep", "assets/audio/beep.mp3");

    // dados
    this.load.json("language", "assets/res/phrases.json");
    this.load.json("experience", "assets/res/experience.json");

    [7, 18, 21].forEach(monster => {
        this.load.atlas(
            "monster_" + monster + "_overworld",
            "assets/img/monsters/overworld/" + monster + ".png",
            "assets/res/monster_" + monster + "_overworld.json"
        );

        this.load.atlas(
            "monster_" + monster, 
            "assets/img/monsters/" + monster + ".png", 
            "assets/res/monster_" + monster + ".json"
        );
    });
};

Battle.create = function () {
    console.log("Battle Scene create");
    console.log("paramêtros da batalha", this.battleParams);

    console.log(this.battleParams.isTutorial ? "É tutorial sim" : "Naõ é tutorial");

    // adiciona background
    const bg = this.add.sprite(
        0,
        0,
        "background"
    ).setOrigin(0, 0);

    this.btn = {};
    this.txt = {};
    this.interfacesHandler = {};

    this.Data.CurrentMonsters = this.battleParams.playerMonsters;

    console.log(this.battleParams);

    // adiciona interface
    this.containers.preAction = this.add.container();
    this.containers.action = this.add.container();
    this.containers.interface = this.add.container();

    this.menuBase = this.add.sprite(0, this.game.config.height - 78, "box_new").setOrigin(0, 0);

    this.containers.interface.add(this.menuBase);

    //console.log("LOLINDIOTA", this.battleParams.opponentPlayerMonsters);

    //console.log(graph);

    //this.battleParams.battleInfo.seen_presentation = 0; // remover

    // vendo qual o tipo de batalha
    switch (+this.battleParams.battleInfo.battle_type) {
        // caso seja selvagem, fazer apresentação do monstro
        case 1: {
            // se o jogador ainda não viu a apresentação
            if (+this.battleParams.battleInfo.seen_presentation == 0) {
                async.series([
                    // iniciar apresentação do monstro selvagem
                    next => this.startWildPresentation(next),
                    // iniciar apresentação do jogador
                    next => this.startPlayerPresentation()
                ]);
            // caso o jogador já viu a apresentação, inicia a "seca"
            } else {
                this.insertRawPlayerAndWildMonsters();
            };

            /*this.startWildPresentation(function () {
                this.startPlayerPresentation();
            }.bind(this));*/
            break;
        };
        // caso seja contra domador, fazer apresentação do domador
        case 2: {
            if (+this.battleParams.battleInfo.seen_presentation == 0) {
                async.series([
                    next => this.startTamerPresentation(next),
                    next => this.startPlayerPresentation()
                ]);
            } else {
                this.insertRawPlayerVsTamer();
            };
            break;
        };

        // caso seja PvP
        case 3: {
            if (+this.battleParams.battleInfo.seen_presentation == 0) {
                async.series([
                    next => this.startOtherPlayerPresentation(next),
                    next => this.startPlayerPresentation()
                ]);
            } else {
                this.insertRawPlayerVersusPlayer();
            };
            break;
        }
    };


    // animação de apresentação do field de batalha 
    // (caso ainda não viu a apresentação)
    if (+this.battleParams.battleInfo.seen_presentation == 0)
        this.startFieldPresentation();
    //this.insertActionMenu();

    var hpPercetage = (this.battleParams.playerMonsters.monster0.current_HP / this.battleParams.playerMonsters.monster0.stats_HP) * 100;

    console.log(hpPercetage);

    // controlar música
    this.manager.audio = "wild_battle";
    this.music = this.sound.add("wild_battle", {
        loop: true
    });
    this.music.play();

    this.fullScreenEnabled = document.fullscreenElement ? true : false;

    this.fullscreenIcon = this.add.sprite(
        453, 
        10,
        "icons"
    )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setFrame(this.fullScreenEnabled ? "icon_fullscreen_on" : "icon_fullscreen_off")
        .setInteractive({
            useHandCursor: true
        });

    this.fullscreenIcon.on("pointerdown", () => {

        this.fullScreenEnabled = !this.fullScreenEnabled;

        toggleFullScreen();

        if (this.fullScreenEnabled) {
            this.fullscreenIcon.setFrame("icon_fullscreen_on");
        } else {
            this.fullscreenIcon.setFrame("icon_fullscreen_off");
        };
    });

    // controlar conexão
    switch (+this.battleParams.battleInfo.battle_type) {
        // se for batalha contra wild e tamer
        case 1:
        case 2:
        case 4:
        {
            this.dispatchSocketListener();
            break;
        };

        // se for pvp
        case 3: {
            // I am = quem eu sou | eu sou o que enviou o convite pro PvP ou o que recebeu?
            this.iAm = this.auth.uid == this.battleParams.battleInfo.uid ? "inviter" : "receiver";
            console.log("Eu sou o " + this.iAm);

            // eventos do pvp
            this.triggerPvPEvents(this.battleParams.battleInfo.id);

            this.isChatOpened = false;
            this.statusShowingChat = false;

            this.chatIcon = new Button(this, {
                x: 447,
                y: 10,
                spritesheet: "icons",
                on: {
                    click: () => {
                        this.toggleChat();
                    }
                },
                frames: {click: "icon_chat", over: "icon_chat", up: "icon_chat", out: "icon_chat"}
            });
            this.containers.interface.add(this.chatIcon.sprite);

            this.chatMessages = "";
            this.countChatMessages = 0;

            var keyEnter = this.input.keyboard.addKey("Enter");

            keyEnter.on("down", () => {

                if (!this.statusShowingChat)
                        return;

                var chatInput = Elements.chat.querySelector("[data-type=chat]");

                if (chatInput.style.display == "none") {
                    this.isChatOpened = true;
                    chatInput.style.display = "block";
                    chatInput.focus();
                } else if (chatInput.style.display != "none" && (chatInput.value.length === 0 || !chatInput.value.trim()) ) {
                    this.isChatOpened = false;
                    chatInput.style.display = "none";
                } else if (chatInput.style.display != "none" && chatInput.value.length > 0) {
                    this.isChatOpened = true;
                    this.sendChatMessage(chatInput.value);
                    chatInput.value = "";
                    chatInput.style.display = "none";
                    this.isChatOpened = false;
                };
            });

            this.keyEnter = keyEnter;
            break;
        };
    };

    // se precisar trocar de monstro que está desmaiado
    if (this.battleParams.battleInfo.need_to_trade_fainted_monster && this.battleParams.battleInfo.battle_type != 3) {
        this.clearMenu();
        this.interfacesHandler.party = new Party(this, {type: "defeated"});
        this.interfacesHandler.party.append();
    };

    // se precisar trocar de monstro q está desmaiado (pvp)
    if (this.battleParams.playerMonsters.monster0.current_HP <= 0 && this.battleParams.battleInfo.battle_type == 3) {
        this.clearMenu();
        this.monster.player.destroy();
        this.interfacesHandler.party = new Party(this, {type: "defeated"});
        this.interfacesHandler.party.append();
    };

    // se precisar de trocar de monstro que está desmaiado
    //if (+this.battleParams.battleInfo.battle_type == 3 && this.battle)
    

    // battle = this;
};

//Battle.update = function () {};

// pegar dados do jogador
Battle.getPlayerData = function (callback) {

    // se não tiver, requisita ao servidor
    this.getPlayerDataCallback = callback;
    this.Socket.emit("69");
};

Battle.getPlayerDataCallback = function () {};

Battle.stopScene = function () {

    this.music.stop();
    this.scene.stop();
};

// monstros que estão em campo
Battle.monster = {
    player: null,
    opponent: null
};

// menu (informações) e hp bar dos monstros que estão em campo
Battle.monsterMenu = {
    player: {},
    opponent: {}
};

Battle.currentMove = {
    id: null,
    attacker: null,
    enabled: false,
    callback: null
};

export default Battle;