import async from "async";

import Battle from "./index";

Battle.dispatchSocketListener = function () {

    // se os eventos de conexão ainda não foram disparados
    if (!this.manager.connection.battle)
        this.triggerConnectionEvents();

    // seta que eventos foram disparados
    this.manager.connection.battle = true;
};

Battle.triggerConnectionEvents = function () {

    const EVENTS = this.database.battle.events;

    // receber resposta do move
    this.Socket.on(EVENTS.MOVE_RESPONSE, data => this.receiveMoveResponse(data));
    // trocar monstro 'faintado'
    this.Socket.on(EVENTS.CHANGE_FAINTED_MONSTER, data => this.changeFaintedMonster(data));
    // seta eventos complementares a batalha
    this.triggerComplementarEvents();
};

Battle.triggerPvPEvents = function (channel) {

    const EVENTS = this.database.battle.events;

    this.pvpListerner = this.Socket.subscribe("p" + channel);
    this.pvpListerner.watch(data => this.receivePvPResponse(data));
    // seta eventos complementares a batalha
    this.triggerComplementarEvents();
};

Battle.triggerComplementarEvents = function () {
    
    // se já foi setado só qita
    if (this.manager.connection.battleComplementar)
        return;

    const EVENTS = this.database.battle.events;

    // receber dados do jogador
    this.Socket.on(EVENTS.RECEIVE_PLAYER_DATA, data => this.getPlayerDataCallback(data));
    // ERRO - não pode executar a ação
    this.Socket.on(EVENTS.ERROR_DATA, data => this.treatActionError(data));

    this.manager.connection.battleComplementar = true;
    
};

Battle.unsetPvPEvents = function () {
    // desinscrevendo do mapa e limpando função de escuta
    this.pvpListerner.unsubscribe();
    this.Socket.unwatch("p" + this.battleParams.battleInfo.id);
};

// mandar movimento ao servidor
Battle.sendMove = function (id) {
    if (this.battleParams.battleInfo.battle_type == 3) {
        const move = this.monster.player._data["move_" + id];
        if (move.manaNeeded) {
            if (this.monster.player._data.current_MP - move.manaNeeded < 0 ) {
                this.treatActionError({error: 3});
                return;
            };
        };
    };
    // desabilitar botões para não clicar mais de uma vez
    for (let i = 0; i < this.butt.length; i ++)
        this.butt[i].sprite.input.enabled = false;
    
    // data = action, param
    //action = {move, item, run, change}

    this.Socket.emit("30", {
        action: "move",
        param: id
    });

    // se for pvp faz esperar e appenda o timer
    if (this.battleParams.battleInfo.battle_type == 3) {
        this.waitChose();
        this.appendHourglass();
    };
};

// usar item
Battle.useItem = function (data) {
    this.Socket.emit("30", {
        action: "item",
        param: data
    });
};

// trocar de monstro que está batalhando
Battle.sendSwitchMonster = function (id) {

    this.currentTradeMonster = id;

    this.Socket.emit("30", {
        action: "change",
        param: id
    });

    // se for pvp põe pra esperar 
    if (this.battleParams.battleInfo.battle_type == 3) {
        this.interfacesHandler.party.clear(true);
        this.waitChose();
        this.appendHourglass();
    };

};

// trocar monstro derrotado no PvP
Battle.sendSwitchDefeatedMonsterPvP = function (id) {
    this.Socket.emit("31", {id});
};

// correr da batalha
Battle.sendRun = function () {

    // desabilitar botões para não clicar mais de uma vez
    for (let i = 0; i < this.butt.length; i ++)
        this.butt[i].sprite.input.enabled = false;
    //move, item, run, change
    
    // enviar para o servidor

    // data = action, param
    this.Socket.emit("30", {
        action: "run"
    });
};


Battle.sendChatMessage = function (message) {
    this.pvpListerner.publish({
        type: 3,
        message
    });
};

// receber resposta depois de enviar a ação
Battle.receiveMoveResponse = function (data) {
    this.doActions(data.actions);
};

// receber resposta do server
Battle.receivePvPResponse = function (data) {
    
    switch (data.type) {

        // fazer moves e ações
        case 0: {

            if (this.hasHouglass)
                this.removeTimerHouglass();

            this.doActions(data.actions);
            break;
        };

        // iniciar timer
        case 1: {
            console.log("Começar timer!");
            this.appendTimer();
            break;
        };

        // timer acabou
        case 2: {
            console.log("Acabou o timer!");

            this.unsetPvPEvents();

            async.waterfall([
                next => this.endPvP(next, data.param.winner),
                win => this.finishBattle(win, true)
            ]);
            
            //console.log(data);
            break;
        };

        // mensagem no chat
        case 3: {
            this.receiveChatMessage(data);
            break;
        };
    };
    // this.doActions(data.actions);
};

Battle.claimTimer = function () {
    this.Socket.emit("39");
};

export default Battle;