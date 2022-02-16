import Overworld from "./index";

import ReplacePhrase from "@/game-old/plugins/replacephrase";

// Setar listener de eventos de socket que o server envia
Overworld.dispatchSocketListener = function () {

    // ** sockets

    // ** verificando possibilidades
    // esperando luta selvagem
    if (this.wild)
        this.receiveWildData(this.wild);

    // se os eventos de conexão ainda não foram disparados, starta
    if (!this.manager.connection.overworld)
        this.bindConnectionEvents();

    // seta que eventos foram disparados
    this.manager.connection.overworld = true;

    // receber eventos do canal do mapa
    this.subscribeToMap(this.Data.CurrentMap);
};

Overworld.bindConnectionEvents = function () {

    const EVENTS = this.database.overworld.events;

    // ** canais
    // canal global
    this.Socket.subscribe("g").watch(data => this.handleGlobal(data));
    // canal que só jogador entra, para alguma ação privada
    this.Socket.subscribe("u-" + this.auth.uid).watch(data => this.handlePrivate(data));

    this.Socket.on(EVENTS.PONG, data => this.calcPing());

    // receber a resposta de comprar ou não
    this.Socket.on(EVENTS.BUY_RESPONSE, data => this.receiveBuyResponse(data));

    // quando a ação do item estiver completa no servidor
    this.Socket.on(EVENTS.ITEM_ACTION, data => this.setItemAction(data));

    // evento de quando o jogador recebe info do monstro selvagem
    this.Socket.on(EVENTS.RECEIVE_WILD, data => this.receiveWildData(data));

    // evento de quando o jogador recebe info da possível batalha selvagem
    this.Socket.on(EVENTS.RECEIVE_WILD_BATTLE, data => this.receiveWildBattle(data));

    // evento de quando o jogador recebe info da batalha contra o domador
    this.Socket.on(EVENTS.RECEIVE_TAMER_BATTLE, data => this.receiveTamerBattle(data));

    // evento de receber algo do servidor após interação com objeto/npc
    this.Socket.on(EVENTS.OBJECT_RESPONSE, data => this.receiveObjectInteraction(data));

    // evento de quando o jogador deverá mudar o mapa
    this.Socket.on(EVENTS.CHANGE_MAP, data => this.changeMap(data));

    // receber players no mapa
    this.Socket.on(EVENTS.RECEIVE_PLAYERS_IN_MAP, data => this.receiveInMapPlayers(data));

    // receber dados do próprio perfil
    this.Socket.on(EVENTS.RECEIVE_SELF_PROFILE_DATA, data => this.appendSelfProfile(data));

    // receber dados do profile de outro player
    this.Socket.on(EVENTS.RECEIVE_PROFILE_DATA, data => this.appendDynamicPlayerProfileInterface(data));

    // evento pra enviar requisição pra atualizar monstros ou itens
    this.Socket.on(EVENTS.REQUEST_UPDATED_MONSTERS_ITEMS, data => this.requestMonstersItems(data));

    // receber itens ou monstros atualizados
    this.Socket.on(EVENTS.RECEIVE_UPDATED_MONSTERS_ITEMS, data => this.receiveUpdatedMonstersItems(data));

    // receber lista de missões
    this.Socket.on(EVENTS.RECEIVE_QUEST_LIST, data => this.receiveQuestList(data));

    // receber dados da quest especifica
    this.Socket.on(EVENTS.RECEIVE_SPECIFIC_QUEST_DATA, data => this.receiveSpecificQuestData(data));

    // receber ação após falar com npc da quest
    this.Socket.on(EVENTS.RECEIVE_QUEST_REQUEST_ACTION, data => this.receiveQuestDataInteraction(data));

    // receber monstros na monsterbox
    this.Socket.on(EVENTS.RECEIVE_IN_BOX_MONSTERS, data => this.appendMonsterBox(data));

    // atualizar página da monsterbox (recurso técnico alternativo)
    this.Socket.on(EVENTS.UPDATE_SPECIFIC_BOX_MONSTERS, () => this.requestBoxPageChange({page: this.currentBoxPage}));

    // receber dados da notificação
    this.Socket.on(EVENTS.RECEIVE_NOTIFICATIONS_DATA, data => this.appendNotifications(data));

    // receber dados da notificação de change move
    this.Socket.on(EVENTS.RECEIVE_MOVE_NOTIFICATION_DATA, data => this.appendMoveNotification(data));

    // receber dados da notificação de evoluir
    this.Socket.on(EVENTS.RECEIVE_EVOLVE_NOTIFICATION_DATA, data => this.appendEvolveNotification(data));

    // receber que aprendfeu move escolhido
    this.Socket.on(EVENTS.RECEIVE_LEARN_MOVE_BY_NOTIFICATION,  () => this.moveLearnedByNotify());

    // receber que escolheu não aprender move
    this.Socket.on(EVENTS.RECEIVE_DONT_LEARN_MOVE_BY_NOTIFICATION, () => this.dontLearnMoveByNotify());

    // Receber que monstro evoluiu
    this.Socket.on(EVENTS.RECEIVE_EVOLVE_BY_NOTIFICATION, () => this.evolveByNotify());
    
    // receber dados da notificação de negociação
    this.Socket.on(EVENTS.RECEIVE_MARKETPLACE_NOTIFICATION_DATA, data => this.appendMarketPlaceNotification(data));
};

Overworld.handleGlobal = function (data) {
    switch (data.type) {
        case 1: {
            this.receiveChatMessage(data);
            break;
        };
    }
};

Overworld.handlePrivate = function (data) {
    console.log("handlou private", data);
    switch (data.action) {
        case 1: {break;};
        case 2: {
            this.addNotification(data);
            break;
        };
        // request de batalha PvP
        case 3: {
            this.appendPvPInviteBox(data.uid, data.nickname);
            break;
        };
        case 4: {break;};
        // iniciar pvp
        case 5: {
            this.receivePvPBattle(data);
            break;
        };
    };
};

// se inscrever e entrar no mapa
Overworld.subscribeToMap = function (id) {
    // configurando conexão
    this.subscribe.map.conn = this.Socket.subscribe("m" + id);
    this.subscribe.map.conn.watch(data => this.treatMapData(data));
    // setando que está conectado
    this.subscribe.map.is = true;
    // storando id do map
    this.subscribe.map.id = id;

    // publicar que entrou no mapa
    this.subscribe.map.conn.publish({
        dir: this.player._data.position.facing,
        dataType: 2
    });

    // delay chato para evitar bugs de posição
    this.mapEntranceDelay();
};

// se desinscrever do mapa
Overworld.unsubscribeToMap = function (callback) {
    // desinscrevendo do mapa e limpando função de escuta
    this.subscribe.map.conn.unsubscribe(callback);
    this.Socket.unwatch("m" + this.subscribe.map.id);
    // setando que não está conectado
    this.subscribe.map.is = false;
};

// tratar oq vem do channel do mapa
Overworld.treatMapData = function (data) {

    //console.log("online player data", data);

    switch(+data.dataType) {
        // walk
        case 1: {
            // definindo que o tipo de objeto é um jogador online
            data.type = 1;

            // se o jogador não estiver no mapa, "appenda" ele no mapa
            if ( !(data.uid in this.online_player_data) )
                return this.appendCharacter(data);

            // fazendo o movimento
            this.online_player_data[data.uid].walk(data.dir);

            break;
        };

        // facing
        case 2: {
            // definindo que o tipo de objeto é um jogador online
            data.type = 1;

            // se o jogador não estiver no mapa, "appenda" ele no mapa
            if ( !(data.uid in this.online_player_data) )
                return this.appendCharacter(data);

            // mudando o facing
            this.online_player_data[data.uid].face(data.dir);
            break;
        };

        // remover sprite (player desconectou)
        case 3: {
            // se o jogador não estiver no mapa, sai da função
            if ( !(data.uid in this.online_player_data) )
                return;

            // efeito de fade out
            this.tweens.add({
                targets: [
                    this.online_player_data[data.uid], 
                    this.online_player_data[data.uid].elements.nickname
                ],
                ease: "Linear",
                duration: 300,
                alpha: 0,
                onComplete: () => {
                   // destroi sprite e deleta do objeto de jogadores online
                   try {
                        this.online_player_data[data.uid].removeSprite();
                    } catch (e) {};
                    delete this.online_player_data[data.uid];
                }
            });
 
 
            break;
        };

        // mudar skin do player
        case 4: {
            this.online_player_data[data.uid].changeSprite(data.sprite);
            break;
        };

        // está digitando
        case 5: {
            console.log(this.online_player_data[data.uid]._data);

            if (data.typing) {
                this.online_player_data[data.uid].addTypingBalloon();
                console.log(`${this.online_player_data[data.uid]._data.nickname} está digitando.`);
            } else {
                this.online_player_data[data.uid].removeTypingBalloon();
                console.log(`${this.online_player_data[data.uid]._data.nickname} não está mais digitando.`);
            };
            break;
        };
    };
};

// Receber resposta da compra
Overworld.receiveBuyResponse = function (data) {

    this.removeLoader();
    if (data.success) {
        this.successToast.show(this.cache.json.get("language").market.successbuy[this.lang]);
        this.clearMarketConfirmWindow();
    } else {
        this.failToast.show(this.cache.json.get("language").market.failbuy[this.lang]);
    };
};

// procurar monstro selvagem 
Overworld.requestWildBattle = function () {
    // chance de achar o monstro 1/5
    if (Math.floor(Math.random() * 4) == 0) {
        this.player._data.stop = true;
        this.Socket.emit("20");
        this.addLoader();
    };
};

// receber data de monstro selvagem (21 - RECEIVE_WILD)
Overworld.receiveWildData = function (data) {
    
    this.removeLoader();

    // esconder d-pad se estiver no mobile
    this.showHideDPad(false);

    // colocando menu do wild
    this.appendWildMenu(data);

    // colocando monstro na sprite
    this.appendWildMonster(this.database.monsters[data.id].name);
};

// receber players que estão no mapa
Overworld.receiveInMapPlayers = function (players) {
    // for (let i = 0; i < players.length; i ++) {
    //     let player = players[i];
    //     this.appendCharacter({
    //         type: 1,
    //         uid: player.uid,
    //         dir: player.pos_facing,
    //         pos: {
    //             x: player.pos_x,
    //             y: player.pos_y
    //         },
    //         char: player.sprite,
    //         nickname: player.nickname
    //     });
    // };

    ;(async () => {
        for await (let player of players) {
            this.appendCharacter({
                type: 1,
                uid: player.uid,
                dir: player.pos_facing,
                pos: {
                    x: player.pos_x,
                    y: player.pos_y
                },
                char: player.sprite,
                nickname: player.nickname
            });
        };
    })();
    //console.log(data);
};

// jogador controla se vai querer batalhar ou não
Overworld.acceptRejectWildBattle = function (wantToBattle) {

    // faz requisição
    this.Socket.emit("22", {
        wantToBattle
    });
};

// receber resposta da escolha de batalha
Overworld.receiveWildBattle = function (data) {

    console.log("infos da batalha", data);

    this.removeLoader();

    // tratando possibilidades
    switch (data.state) {
        // pode fugir
        case 1: {
            // limpa interface
            this.interfacesHandler.wildMenu.clear();
            // fadeout do wild monster
            this.tweens.add({
                targets: this.wildMonster,
                ease: "Linear",
                duration: 600,
                alpha: 0,
                onComplete: () => {
                    // destruir sprite
                    this.wildMonster.destroy();
                    // liberar jogador
                    this.time.addEvent({
                        delay: 300, 
                        callback: () => {
                            this.player._data.stop = false;
                            this.showHideDPad(true);
                        }
                    });
                }
            });

            break;
        };

        // não pode fugir, oponente começa atacando
        case 2: {
            this.preWildBattleEffect(() => {
                this.stopScene();

                // instanciar módulo de batalha com todas as dependencias
                this.scene.start("battle", {

                    data: this.Data,
                    socket: this.Socket,

                    auth: this.auth,
                    player: this.player._data,

                    flag: this.flag,

                    manager: this.manager,

                    // parâmetros
                    param: data.param
                });
            });

            break;
        };

        // jogador aceitou a batalha
        case 3: {
            this.preWildBattleEffect(() => {
                this.stopScene();

                // instanciar módulo de batalha com todas as dependencias
                this.scene.start("battle", {

                    data: this.Data,
                    socket: this.Socket,

                    auth: this.auth,
                    player: this.player._data,

                    flag: this.flag,

                    manager: this.manager,

                    // parâmetros
                    param: data.param
                });

            });

            break;
        };
    };
};

// receber batalha do domador
Overworld.receiveTamerBattle = function (data) {
    this.stopScene();

    this.scene.start("battle", {

        data: this.Data,
        socket: this.Socket,

        auth: this.auth,
        player: this.player._data,

        flag: this.flag,
        tamers: this.tamers,

        manager: this.manager,

        objectPositions: this.cache.json.get(this.getCurrentMapName("events")).elements.config,

        // parâmetros
        param: data.param
    });
};

// receber batalha de PvP
Overworld.receivePvPBattle = function (data) {
    this.stopScene();

    // instanciar scene de batalha com todas as dependencias
    this.scene.start("battle", {

        data: this.Data,
        socket: this.Socket,

        auth: this.auth,
        player: this.player._data,

        flag: this.flag,

        manager: this.manager,

        // parâmetros
        param: {
            playerMonsters: this.Data.CurrentMonsters,
            opponentPlayerMonsters: data.opponentPlayerMonsters,
            opponentData: data.opponentData,
            battleInfo: data.battleInfo,
            items: this.Data.CurrentItems
        }
    });
};

// requestar execução de flag no servidor
Overworld.requestFlag = function (data) {
    
    if (!data.dontNeedLoadSprite)
        this.addLoader();

    this.Socket.emit("40", data);
};

// requestar ação da missão
Overworld.requestQuest = function (data) {
    this.addLoader();
    this.Socket.emit("74", data);
};

Overworld.requestStartQuest = function (data) {
    this.Socket.emit("75", data);
};

// requestar monstros ou itens atualizados
Overworld.requestMonstersItems = function (data) {
    this.Socket.emit("68", data);
};

// requisitar dados do perfil do player online
Overworld.requestPlayerProfile = function (uid) {
    this.Socket.emit("53", {uid});
    // resposta = 54 - RECEIVE_PROFILE_DATA
};

// requisitar batalha pvp com outro player
Overworld.requestPvPInvite = function (uid) {
    this.Socket.publish("u-" + uid, {
        action: 3
    });
};

// recebe monsttros ou itens atualizados
Overworld.receiveUpdatedMonstersItems = function (response) {
    switch (+response.type) {

        case 1: {
            this.Data.CurrentMonsters = response.data;
            break;
        };

        case 2: {
            this.Data.CurrentItems = response.data;
            break;
        };
    }
};

// receber resposta do servidor após interação com objeto/npc
Overworld.receiveObjectInteraction = function (data) {

    if (!this.currentObjectInteracted)
        return console.log("LOL VAI TNC POHA");

    this.removeLoader();

    const events = this.cache.json.get(this.getCurrentMapName("events"));

    this.automatizeAction({
        type: events.elements.config[this.currentObjectInteracted].type,
        name: this.currentObjectInteracted
    }, events.elements.screenplay[this.currentObjectInteracted]["server_response"][data.type + "-" + data.flag_id][data.value]);
};

Overworld.receiveQuestDataInteraction = function (data) {

    this.removeLoader();

    const events = this.cache.json.get(this.getCurrentMapName("events"));

    this.automatizeAction({
        type: events.elements.config[this.currentObjectInteracted].type,
        name: this.currentObjectInteracted
    }, events.elements.screenplay[this.currentObjectInteracted]["server_response"][data.param]);
};

Overworld.useItem = function (data) {
    this.addLoader();
    this.Socket.emit("10", data);
};

Overworld.requestBuyItem = function (data) {
    this.addLoader();
    this.Socket.emit("11", data);
};

Overworld.requestBoxPageChange = function (data) {
    this.Socket.emit("12", data);
};

// requestar mudança de mapa (híbrido)
Overworld.requestMapChange = function (mid, tid) {
    this.player._data.stop = true;
    // salvando teleport id
    this.tid = tid;
    // enviando map id e teleport id
    this.Socket.emit("50", { mid, tid });
};

// [x] requestar mudança de posição na party do monstro
Overworld.requestChangePartyPosition = function (from, to) {
    // from = monstro que será trocado
    // to = monstro que ficará no lugar do 'from'

    this.Socket.emit("65", {from, to});
};

// [x] requestar mudança de posição da box pra uma pra um slot vazio da party
Overworld.requestChangeBoxToEmptyParty = function (from, to) {
    // from = monstro que está na box será trocado
    // to = lugar que está vazio na party
    this.Socket.emit("63", {from, to});
};

// [x] requestar mudança de box para a party (não vazio)
Overworld.requestChangeBoxToParty = function (from, to) {
    this.Socket.emit("62", {from, to});
};

// [x] requestar mudança de posição na party pra uma da box vazia
Overworld.requestChangePartyToEmptyBox = function (from, to) {
    // from = monstro da party que será trocado
    // to = lugar que está vazio na box
    this.Socket.emit("64", {from, to});
};

// [x] requestar mudança de posição na box do monstro
Overworld.requestChangeBoxPosition = function (from, to) {
    // from = lugar que sairá
    // to = lugar q ficará

    this.Socket.emit("67", {from, to});
};

// enviar mensagem no chat do mapa
Overworld.sendChatMessage = function (message) {
    console.log("mensagem enviada", message);

    // enviar mensagem pro servidor
    this.Socket.publish("g", {
        type: 1,
        message
    });

    // appenda mensagem
    this.receiveChatMessage({
        message,
        nickname: this.player._data.nickname
    });
};

// enviar que está digitando
Overworld.sendTypingBalloon = function (typing) {
    this.subscribe.map.conn.publish({
        typing,
        dataType: 5
    });
};

// requisitar lista de quests
Overworld.requestQuestsList = function (page, callback) {

    this.questListCallback = callback;

    this.Socket.emit("70", {
        page
    });
};

// requisitar dados especificos de uma quest
Overworld.requestSpecificQuestData = function (quest_id, callback) {
    this.specificQuestDataCallback = callback;
    this.currentQuestId = quest_id;

    this.Socket.emit("71", {
        quest_id
    });
};

// receber lista de quests
Overworld.receiveQuestList = function (data) {

    if (this.questListCallback && typeof(this.questListCallback) === "function")
        this.questListCallback(data);
};

// receber dados especificos da quest
Overworld.receiveSpecificQuestData = function (data) {
    //console.log(data);

    let text = ``;

    console.log(
        "aff", 
        this.database.quests, 
        this.currentQuestId, 
        this.database.quests[this.currentQuestId]
    );

    const in_db_quest_data = this.database.quests[this.currentQuestId];

    for (let i = 0; i < in_db_quest_data.requisits.length; i ++) {
        let requisit = in_db_quest_data.requisits[i];

        let amount = data.filter(_data => 
            _data.action_type == this.invertedQuestAction[requisit.type] &&
            _data.monsterpedia_id == requisit.monsterpedia_id
        );

        text += "- " + ReplacePhrase(
            this.cache.json.get("language").quest[requisit.type][this.lang], {
                monster: this.database.monsters[requisit.monsterpedia_id].name,
                amountlength: amount.length,
                amount: requisit.amount,
                _amount: requisit.amount // gambi arrumar
            }) + "\n";
    };

    if (this.specificQuestDataCallback && typeof(this.specificQuestDataCallback) === "function")
        this.specificQuestDataCallback(text);
};

// Requisitar dados das notificações
Overworld.requestNotificationsData = function (data) {
    this.Socket.emit("80", data);
};

// Requisitar dados da notificação de aprender move
Overworld.requestMoveNotification = function (id) {
    this.Socket.emit("81", {id});
    // -> resposta: 90 - RECEIVE_MOVE_NOTIFICATION_DATA
};

// Requisitar dados da notificação de evoluir
Overworld.requestEvolveNotification = function (id) {
    this.Socket.emit("82", {id});
    // -> resposta: 91 - RECEIVE_MOVE_NOTIFICATION_DATA
};

Overworld.requestNegotiationNotification = function (id) {
    this.Socket.emit("86", {id});
    // -> resposta: 95 - RECEIVE_MOVE_NOTIFICATION_DATA
};


// Requisitar mudar move (pela notificação)
Overworld.requestChangeMoveByNotification = function (data) {
    this.Socket.emit("84", data);
};

// Requisitar não aprender move (pela notificação)
Overworld.requestDontLearnMove = function (data) {
    this.Socket.emit("87", data);
};

// Requisitar evoluir monstro (pela notificação)
Overworld.requestEvolveByNotification = function (data) {
    this.Socket.emit("85", data);
};

// Setar que já viu a notificação
Overworld.setNotificationSeen = function (data) {
    this.Socket.emit("88", data);
};

// Requisitar monster box
Overworld.requestMonsterBox = function (data) {
    this.Socket.emit("12");
};

Overworld.ping = function () {
    this.Socket.emit("0");
    this.pingDate = Date.now();
};

Overworld.calcPing = function () {
    console.log("ping: ", Date.now() - this.pingDate);
};

export default Overworld;