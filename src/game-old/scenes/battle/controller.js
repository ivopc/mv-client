import async from "async";
import _ from "underscore";

import Battle from "./index";

// Interfaces
import Party from "@/game/interfaces/party";

// Libs próprias
import ReplacePhrase from "@/game/plugins/replacephrase";

// Fazer todas as ações
Battle.doActions = function (actions) {

    console.log("ações", actions);

    this.actions = actions;

    // ** stora ações pre, regulares e post
    let pre_fn = [],
        regular_fn = [],
        post_fn = [],
        all_fn = [];

    // ** loopa ações e add a array de funções
    for (let i = 0, l = actions.preTurn.length; i < l; i ++)
        pre_fn.push(next => this.doPre(actions.preTurn[i], i, next));

    for (let i = 0, l = actions.regular.length; i < l; i ++)
        regular_fn.push(next => this.doRegular(actions.regular[i], i, next));

    for (let i = 0, l = actions.postTurn.length; i < l; i ++)
        post_fn.push(next => this.doPost(actions.postTurn[i], i, next));

    all_fn = [... pre_fn, ... regular_fn, ... post_fn];

    // executa as ações pre, regulares e post de maneira enfileirada
    async.series(all_fn, this.finishTurn);
};

// Fazer ação pre turn
Battle.doPre = function (action, index, next) {

    if (!action) {
        next();
        return;
    };

    switch (action.fn_name) {
        // caso o monstro acordou do sleep
        case "awake": {
            this.awaked(action, next);
            break;
        };

        // caso usou poção healer
        case "health_potion": {
            this.useHealthPotion(action, next);
            break;
        };

        // caso usou selo mágico
        case "magic_seal": {
            this.useSeal(action, next);
            break;
        };

        // caso mudou de monstro
        case "change_monster": {
            this.changeMonster(action, next);
            break;
        };

        // trocar monstro desmaiado (no pvp)
        case "change_fainted_pvp": {
            this.changeFaintedMonsterPvP(action, next);
            break;
        };
        // caso está tentando fugir
        case "run": {
            this.tryRun(action, next);
            break;
        };
    };
};

// Fazer ação regular
Battle.doRegular = function (action, index, next) {

    if (!action) {
        next();
        return;
    };

    switch (action.fn_name) {
        // caso for movimento de dano
        case "move_damage": {
            this.moveDamage(action, next);
            break;
        };

        // caso for movimento de buff/nerf
        case "buff_nerf": {
            this.moveBuffNerf(action, next);
            break;
        };

        // caso for movimento de status problem
        case "status_problem": {
            this.moveStatusProblem(action, next);
            break;
        };

        // caso dropou item
        case "item_drop": {
            this.dropItem(action, index, next);
            break;
        };
    };
};

// Fazer ação post turn
Battle.doPost = function (action, index, next) {
    console.log({action, index});

    if (!action) {
        next();
        return;
    };

    switch (action.fn_name) {
        // damage cru
        case "raw_damage": {

            let target;

            if (action.param.id == this.monster.player._data.id) {
                target = "player";
            } else if (action.param.id == this.monster.opponent._data.id) {
                target = "opponent";
            };

            switch (action.param.type) {
                case "psn": {
                    this.poisonDiscount(action, target, next);
                    break;
                };
            };

            break;
        };

        // caso monstro desmaiou
        case "fainted": {
            this.monsterFainted(action, index, next);
            break;
        };
    };
};

// Executar param `move_damage`
Battle.moveDamage = function (action, callback) {

    this.currentMove.id = action.param.move_id;
    this.currentMove.attacker = action.id;

    //console.log(this.iAm, this.currentMove.attacker);

    // caso seja PvP ajustar o nome do attacker
    if (this.battleParams.battleInfo.battle_type == 3) {
        if (this.iAm == this.currentMove.attacker) {
            this.currentMove.attacker = "player";
        } else {
            this.currentMove.attacker = "opponent";
        };
    };

    let monster_name, foe = "";

    switch (this.currentMove.attacker) {
        case "player": {
            monster_name = this.monster.player._data.nickname ||  this.database.monsters[this.monster.player._data.monsterpedia_id].name;
            break;
        };

        case "opponent": {
            monster_name = this.monster.opponent._data.nickname || this.database.monsters[this.monster.opponent._data.monsterpedia_id].name;
            foe = "opponent";
        };
    };

    this.clearMenu();

    // se errou o move
    if (!action.param.hited) {
        this.cantHit(foe, callback);
        return;
    };

    // se não pode fazer o move
    if (!action.param.canDoMove) {
        this.cantDoMove(foe, callback);
        return;
    };

    this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["usedatk" + foe][this.lang], {monster: monster_name, move: this.database.moves[this.currentMove.id].name[this.lang]}), {
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    });

    async.series([
        // animação do move
        next => {
            this.moves[this.currentMove.attacker][this.currentMove.id].bind(this)(next);
        },
        next => {

            // descontar HP do oponente e verificar se precisa de mana
            this.discountHealthPoints(
                action,
                next
            );

            if (this.database.moves[action.param.move_id].manaNeeded)
                this.discountMana(
                    action
                );
        },
        () => callback()
    ]);
};

// Executar param `buff_nerf`
Battle.moveBuffNerf = function (action, callback) {
    this.currentMove.id = action.param.move_id;
    this.currentMove.attacker = action.id;
    this.currentMove.target = action.target.name;

    console.log("=----------------------------------------------");
    console.log(action);
    // action.param.effectTarget

    // caso seja PvP ajustar o nome do attacker
    if (this.battleParams.battleInfo.battle_type == 3) {
        if (this.iAm == this.currentMove.attacker) {
            this.currentMove.attacker = "player";
            this.currentMove.target = "opponent";
        } else {
            this.currentMove.attacker = "opponent";
            this.currentMove.target = "player";
        };
    };

    let monster_name = {attacker: null, target: null},
        foe = "",
        foe2 = "";

    switch (this.currentMove.attacker) {
        case "player": {
            monster_name.attacker = this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name;
            monster_name.target = this.monster.opponent._data.nickname || this.database.monsters[this.monster.opponent._data.monsterpedia_id].name;

            foe2 = "opponent";
            break;
        };

        case "opponent": {
            monster_name.attacker = this.monster.opponent._data.nickname || this.database.monsters[this.monster.opponent._data.monsterpedia_id].name;
            monster_name.target = this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name;
            foe = "opponent";
        };
    };

    // se o buff for pro proprio monstro que está usando o ataque
    if (action.param.effectTarget == "self") {
        monster_name.target = monster_name.attacker;
        this.currentMove.target = this.currentMove.attacker;

        // mudando texto do buff no stat
        if (this.currentMove.attacker == "player")
            foe2 = "";
    };

    this.clearMenu();

    // se errou o move
    if (!action.param.hited) {
        this.cantHit(foe, callback);
        return;
    };

    // se não pode fazer o move
    if (!action.param.canDoMove) {
        this.cantDoMove(foe, callback);
        return;
    };

    // texto de usou o ataque
    this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["usedatk" + foe][this.lang], {monster: monster_name.attacker, move: this.database.moves[this.currentMove.id].name[this.lang]}), {
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    });

    async.series([
        // animação do move
        next => {
            this.moves[this.currentMove.attacker][this.currentMove.id].bind(this)(next);
        },
        next => {
            for (let i = 0, l = action.param.effect.length; i < l; i ++) {

                let stat;
                /*atk = 0
                def = 1
                spe = 2
                accuracy = 3
                evasion = 4*/
                switch (action.param.effect[i].stat) {
                    case 0: {
                        stat = "atk";
                        break;
                    };
                    case 1: {
                        stat = "def";
                        break;
                    };
                    case 2: {
                        stat = "spe";
                        break;
                    };

                    case 3: {
                        stat = "acc";
                        break;
                    };

                    case 4: {
                        stat = "eva";
                        break;
                    };
                };

                this.appendUpdateBuffNerf(this.currentMove.target, stat, action.param.effect[i].value);
            };

            next();
        },
        next => {

            const fns = [];

            for (let i = 0, l = action.param.effect.length; i < l; i ++) {
                fns.push(_next => {
                    this.clearMenu();

                    let stat;

                    switch (action.param.effect[i].stat) {
                        case 0: {
                            stat = "atk";
                            break;
                        };
                        case 1: {
                            stat = "def";
                            break;
                        };
                        case 2: {
                            stat = "spe";
                            break;
                        };

                        case 3: {
                            stat = "acc";
                            break;
                        };

                        case 4: {
                            stat = "eva";
                            break;
                        };
                    };

                    let increaseDecrease = action.param.effect[i].value > 0 ? "increase" : "decrease",
                        _stat = this.cache.json.get("language").battle["stat_" + stat][this.lang];

                    this.text[0] = this.add.text(
                        this.menuBase.x + 5, this.menuBase.y + 5, 
                        ReplacePhrase(this.cache.json.get("language").battle["stat" + increaseDecrease + foe2][this.lang], {monster: monster_name.target, stat: _stat}), {
                        fontFamily: "Century Gothic", 
                        fontSize: 14, 
                        color: "#fff" 
                    });

                    console.log("stat" + increaseDecrease + foe2, "VAI TOMA NO CU");

                    this.time.addEvent({delay: 2000, callback: _next});
                });
            };

            async.series(fns, next);
        },
        next => callback()
    ])
};

// Executar param `status_problem`
Battle.moveStatusProblem = function (action, callback) {
    this.currentMove.id = action.param.move_id;
    this.currentMove.attacker = action.id;

    //console.log(this.iAm, this.currentMove.attacker);

    // caso seja PvP ajustar o nome do attacker
    if (this.battleParams.battleInfo.battle_type == 3) {
        if (this.iAm == this.currentMove.attacker) {
            this.currentMove.attacker = "player";
        } else {
            this.currentMove.attacker = "opponent";
        };
    };

    let monster_name,
        foe = "";

    switch (this.currentMove.attacker) {
        case "player": {
            monster_name = this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name;
            break;
        };

        case "opponent": {
            monster_name = this.monster.opponent._data.nickname || this.database.monsters[this.monster.opponent._data.monsterpedia_id].name;
            foe = "opponent";

        };
    };

    console.log("status problem", action.param.stat_problem);

    this.clearMenu();

    // se errou o move
    if (!action.param.hited) {
        this.cantHit(foe, callback);
        return;
    };

    // se não pode fazer o move
    if (!action.param.canDoMove) {
        this.cantDoMove(foe, callback);
        return;
    };

    this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["usedatk" + foe][this.lang], {monster: monster_name, move: this.database.moves[this.currentMove.id].name[this.lang]}), {
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    });

    async.series([
        // animação do move
        next => {
            this.moves[this.currentMove.attacker][this.currentMove.id].bind(this)(next);
        },
        next => {

            // alterar status_problem do alvo
            switch (this.currentMove.attacker) {
                case "player": {
                    this.monster.opponent._data.status_problem = action.param.stat;
                    this.monsterMenu.opponent.statusProblem = this.add.sprite(
                        this.monsterMenu.opponent.text.name.x + this.monsterMenu.opponent.text.name.displayWidth + 2,
                        this.monsterMenu.opponent.text.name.y + 3,
                        "status-problem"
                    )
                        .setFrame(this.database.status_problem[this.monster.opponent._data.status_problem])
                        .setScrollFactor(0)
                        .setOrigin(0, 0);

                    this.monsterMenu.opponent.statusProblem.scale = 0.25;

                    this.containers.interface.add(this.monsterMenu.opponent.statusProblem);
                    break;
                };

                case "opponent": {
                    this.monster.player._data.status_problem = action.param.stat;
                    this.monsterMenu.player.statusProblem = this.add.sprite(
                        this.monsterMenu.player.text.name.x + this.monsterMenu.player.text.name.displayWidth + 2,
                        this.monsterMenu.player.text.name.y + 3,
                        "status-problem"
                    )
                        .setFrame(this.database.status_problem[this.monster.player._data.status_problem])
                        .setScrollFactor(0)
                        .setOrigin(0, 0);

                    this.monsterMenu.player.statusProblem.scale = 0.25;
                    this.containers.interface.add(this.monsterMenu.player.statusProblem);

                };
            };

            this.time.addEvent({delay: 1500, callback: next});
        },
        () => callback()
    ]);
};

// Executar param `health_potion`
Battle.useHealthPotion = function (action, callback) {
    console.log("potion", action);

    // remover item from client
    this.removeItem(+action.param.item_id);

    const 
        monster = this.battleParams.playerMonsters["monster" + this.currentPartyTooltipOpened],
        new_HP = monster.current_HP + action.param.effect.heal > monster.stats_HP ? monster.stats_HP : monster.current_HP + action.param.effect.heal;

    monster.current_HP = new_HP;

    const hpPercetage = (new_HP / monster.stats_HP) * 100;

    if (this.currentPartyTooltipOpened == 0)
        this.monsterMenu.player.healthBar.setPercentDirectly(hpPercetage);

    async.series([
        // seta barra de HP
        next => {

            this.slots[this.currentPartyTooltipOpened].elements.healthBar.setPercent(hpPercetage);

            this.time.addEvent({delay: 1200, callback: next});
        },
        // limpa menus e add texto
        next => {
            this.interfacesHandler.party.clear(true);
            this.clearMenu();

            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["useditem"][this.lang], {player: "Ivopc", item: this.database.items[this.selectedItem].name[this.lang]}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });

            this.time.addEvent({delay: 2000, callback: next});
        }
    ], () => callback());
};

// Executar param `magic_seal`
Battle.useSeal = function (action, callback) {

    console.log("selo", action);

    // remover item from client
    this.removeItem(+action.param.item_id);

    // ---> se domou <---
    if (action.param.tamed) {
        
        async.series([
            // jogou selo
            next => {
                this.clearMenu();

                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["usedseal"][this.lang], {player: "Ivopc", seal: this.database.items[action.param.item_id].name[this.lang]}), {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                });

                this.time.addEvent({delay: 2000, callback: next});
            },
            // wild foi captura
            next => {
                this.clearMenu();

                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["catchsuccess"][this.lang], {monster: this.database.monsters[this.battleParams.wild.monsterpedia_id].name}), {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                });

                this.tweens.add({
                    targets: this.monster.opponent,
                    ease: "Linear", 
                    duration: 800,
                    props: {
                        scaleX: {value: 0.001},
                        scaleY: {value: 0.001},
                        alpha: {value: 0}
                    }
                });

                this.time.addEvent({delay: 2000, callback: next});
            },
            () => this.finishBattle(true)
        ]);
    } else {
    // ---> se não domou <---
        async.series([
            // jogou selo
            next => {
                this.clearMenu();

                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["usedseal"][this.lang], {player: "Ivopc", seal: this.database.items[action.param.item_id].name[this.lang]}), {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                });

                this.time.addEvent({delay: 2000, callback: next});
            },
            // wild não foi captura
            next => {
                this.clearMenu();

                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["catchfail"][this.lang], {monster: this.database.monsters[this.battleParams.wild.monsterpedia_id].name}), {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                });

                this.time.addEvent({delay: 2000, callback: next});
            },
            () => callback()
        ]);
    };
};

// Executar param `change_moster`
Battle.changeMonster = function (action, callback) {

    // verificando se é PvP
    if (action.id == "inviter" || action.id == "receiver") {
        // se não for o próprio player, chama função de trocar o monstro do oponente
        if (this.iAm !== action.id) {
            this.changePvPMonster(action, callback);
            return;
        };
    };

    // limpa interface
    this.interfacesHandler.party.clear(true);

    // criando novo objeto dos monstros do jogador
    const new_order = _.clone(this.battleParams.playerMonsters);

    //console.log("currentlol", this.currentTradeMonster);

    // trocando monstros de lugar na variável
    this.battleParams.playerMonsters.monster0 = new_order["monster" + this.currentTradeMonster];
    this.battleParams.playerMonsters["monster" + this.currentTradeMonster] = new_order.monster0;

    const monster = this.battleParams.playerMonsters.monster0;

    async.series([
        // mostrar texto pra trocar de monstro
        next => {
            this.clearMenu();

            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["comeback"][this.lang], {monster: new_order.monster0.nickname || this.database.monsters[new_order.monster0.monsterpedia_id].name}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });

            this.time.addEvent({delay: 2000, callback: next});
        },
        // animação de tirar o monstro
        next => {
            this.tweens.add({
                targets: this.monster.player,
                ease: "Linear", 
                duration: 800,
                props: {
                    scaleX: {value: 0.001},
                    scaleY: {value: 0.001},
                    alpha: {value: 0}
                }
            });

            let targets = [
                this.monsterMenu.player.healthBar.bgSprite, 
                this.monsterMenu.player.healthBar.barSprite,
                this.monsterMenu.player.manaBar.bgSprite,
                this.monsterMenu.player.manaBar.barSprite,
                this.monsterMenu.player.expBar.bgSprite,
                this.monsterMenu.player.expBar.barSprite,
                this.monsterMenu.player.hud,
                this.monsterMenu.player.text.name,
                this.monsterMenu.player.text.level
            ];

            if (this.monster.player._data.status_problem > 0) {
                console.log("VAI SE FUDER FDP 78");
                targets.push(this.monsterMenu.player.statusProblem);
            };


            this.tweens.add({
                targets,
                ease: "Linear",
                duration: 800,
                alpha: 0
            });

            this.time.addEvent({delay: 1500, callback: next});
        },
        next => {
            this.clearMenu();

            // destruindo sprite antiga
            this.monster.player.destroy();
            this.monsterMenu.player.text.name.destroy();
            this.monsterMenu.player.text.level.destroy();

            // mostrar texto que troca de monstro
            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["gomonster"][this.lang], {monster: monster.nickname || this.database.monsters[monster.monsterpedia_id].name}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });

            this.time.addEvent({delay: 900, callback: next});
        },
        // insere monstro novo
        next => {

            const monster_id = monster.monsterpedia_id;

            // mudar barras (visualmente)
            this.monsterMenu.player.healthBar.setPercentDirectly((monster.current_HP / monster.stats_HP) * 100);
            this.monsterMenu.player.manaBar.setPercentDirectly((monster.current_MP / monster.stats_MP) * 100);
            this.monsterMenu.player.expBar.setPercentDirectly(this.getExpPercetage(this.monster.player._data));

            this.monster.player = this.add.sprite(
                58,
                120,
                "monster_" + monster_id
            ).setOrigin(0, 0);

            this.monster.player._data = monster;

            this.monsterMenu.player.text.name = this.add.text(42, 7, this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name, {
                fontFamily: "Century Gothic", 
                fontSize: 9, 
                color: "#000" 
            }); 

            this.monsterMenu.player.text.level = this.add.text(168, 7, this.monster.player._data.level, {
                fontFamily: "Century Gothic", 
                fontSize: 9, 
                color: "#000" 
            });

            this.containers.interface.add(this.monsterMenu.player.text.name);
            this.containers.interface.add(this.monsterMenu.player.text.level);

            this.addMonsterAnims(monster_id, this.monster.player);
            this.monster.player.anims.play(this.database.battle.sprites[monster_id].name + "_idle");

            this.containers.action.add(this.monster.player);

            this.monster.player.setOrigin(
                this.database.battle.sprites[monster_id].action.player.origin.x, 
                this.database.battle.sprites[monster_id].action.player.origin.y
            );

            // seta scale do monstro pro bem minimo
            this.monster.player.scaleX = 0.001;
            this.monster.player.scaleY = 0.001;

            // seta alpha pra minimo
            this.monster.player.alpha = 0;

            // troca buff/nerf
            this.checkAndAppendBuffNerf(true);

            let targets = [
                this.monsterMenu.player.healthBar.bgSprite, 
                this.monsterMenu.player.healthBar.barSprite,
                this.monsterMenu.player.manaBar.bgSprite,
                this.monsterMenu.player.manaBar.barSprite,
                this.monsterMenu.player.expBar.bgSprite,
                this.monsterMenu.player.expBar.barSprite,
                this.monsterMenu.player.hud,
                this.monsterMenu.player.text.name,
                this.monsterMenu.player.text.level
            ];

            if (this.monster.player._data.status_problem > 0) {
                console.log("VAI SE FUDER FDP 120");
                this.monsterMenu.player.statusProblem = this.add.sprite(
                    this.monsterMenu.player.text.name.x + this.monsterMenu.player.text.name.displayWidth + 2,
                    this.monsterMenu.player.text.name.y + 3,
                    "status-problem"
                )
                    .setFrame(this.database.status_problem[this.monster.player._data.status_problem])
                    .setScrollFactor(0)
                    .setOrigin(0, 0);

                this.monsterMenu.player.statusProblem.scale = 0.25;
                this.monsterMenu.player.statusProblem.alpha = 0;

                this.containers.interface.add(this.monsterMenu.player.statusProblem);
                
                targets.push(this.monsterMenu.player.statusProblem);
            };

            // feida menu do monstro
            this.tweens.add({
                targets,
                ease: "Linear",
                duration: 800,
                alpha: 1
            });

            // adiciona tween de redimensionar e alpha
            this.tweens.add({
                targets: this.monster.player,
                ease: "Linear", 
                duration: 800,
                props: {
                    scaleX: {value: 1},
                    scaleY: {value: 1},
                    alpha: {value: 1}
                },
                onComplete: () => next()
            });
        },
        next => {
            this.clearMenu();
            this.insertActionMenu();
            next();
        }

    ], () => callback());
};

// Complementar ao `change_moster` quando está no PvP (outro jogador)
Battle.changePvPMonster = function (action, callback) {
    // criando novo objeto dos monstros do jogador
    const new_order = _.clone(this.battleParams.opponentPlayerMonsters);

    //console.log("currentlol", this.currentTradeMonster);

    // trocando monstros de lugar na variável
    this.battleParams.opponentPlayerMonsters.monster0 = new_order["monster" + action.param.index];
    this.battleParams.opponentPlayerMonsters["monster" + action.param.index] = new_order.monster0;

    const monster = this.battleParams.opponentPlayerMonsters.monster0;

    async.series([
        // mostrar texto pra trocar de monstro
        next => {
            this.clearMenu();

            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["comeback"][this.lang], {monster: new_order.monster0.nickname || this.database.monsters[new_order.monster0.monsterpedia_id].name}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });

            this.time.addEvent({delay: 2000, callback: next});
        },
        // animação de tirar o monstro
        next => {
            this.tweens.add({
                targets: this.monster.opponent,
                ease: "Linear", 
                duration: 800,
                props: {
                    scaleX: {value: 0.001},
                    scaleY: {value: 0.001},
                    alpha: {value: 0}
                }
            });

            let targets = [
                this.monsterMenu.opponent.healthBar.bgSprite, 
                this.monsterMenu.opponent.healthBar.barSprite,
                this.monsterMenu.opponent.hud,
                this.monsterMenu.opponent.text.name,
                this.monsterMenu.opponent.text.level
            ];

            if (this.monster.opponent._data.status_problem > 0) {
                console.log("VAI SE FUDER FDP 98798");
                targets.push(this.monsterMenu.opponent.statusProblem);
            };

            this.tweens.add({
                targets,
                ease: "Linear",
                duration: 800,
                alpha: 0
            });

            this.time.addEvent({delay: 1500, callback: next});
        },
        next => {
            this.clearMenu();

            // destruindo sprite antiga
            this.monster.opponent.destroy();
            this.monsterMenu.opponent.text.name.destroy();
            this.monsterMenu.opponent.text.level.destroy();
            if (this.monster.player._data.status_problem > 0) {
                console.log("VAI SE FUDER FDP 76678978");
                this.monsterMenu.player.statusProblem.destroy();
            };

            // mostrar texto que troca de monstro
            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["gomonster"][this.lang], {monster: monster.nickname || this.database.monsters[monster.monsterpedia_id].name}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });

            this.time.addEvent({delay: 900, callback: next});

        },
        // insere monstro novo
        next => {

            const monster_id = monster.monsterpedia_id;

            // mudar barras (visualmente)
            this.monsterMenu.opponent.healthBar.setPercentDirectly((monster.current_HP / monster.stats_HP) * 100);

            this.monster.opponent = this.add.sprite(
                315,
                120,
                "monster_" + monster_id
            ).setOrigin(0, 0);

            this.monster.opponent.flipX = true;

            this.monster.opponent._data = monster;

            this.monsterMenu.opponent.text.name = this.add.text(316, 11, this.monster.opponent._data.nickname || this.database.monsters[this.monster.opponent._data.monsterpedia_id].name, {
                fontFamily: "Century Gothic", 
                fontSize: 9, 
                color: "#000" 
            }); 

            this.monsterMenu.opponent.text.level = this.add.text(418, 10, this.monster.opponent._data.level, {
                fontFamily: "Century Gothic", 
                fontSize: 9, 
                color: "#000" 
            });

            this.containers.interface.add(this.monsterMenu.opponent.text.name);
            this.containers.interface.add(this.monsterMenu.opponent.text.level);

            this.addMonsterAnims(monster_id, this.monster.opponent);
            this.monster.opponent.anims.play(this.database.battle.sprites[monster_id].name + "_idle");

            this.containers.action.add(this.monster.opponent);

            this.monster.opponent.setOrigin(
                this.database.battle.sprites[monster_id].action.opponent.origin.x, 
                this.database.battle.sprites[monster_id].action.opponent.origin.y
            );

            // seta scale do monstro pro bem minimo
            this.monster.opponent.scaleX = 0.001;
            this.monster.opponent.scaleY = 0.001;

            // seta alpha pra minimo
            this.monster.opponent.alpha = 0;
            this.monsterMenu.opponent.text.name.alpha = 0;
            this.monsterMenu.opponent.text.level.alpha = 0;

            // troca buff/nerf
            this.checkAndAppendBuffNerf(true);

            let targets = [
                this.monsterMenu.opponent.healthBar.bgSprite, 
                this.monsterMenu.opponent.healthBar.barSprite,
                this.monsterMenu.opponent.hud,
                this.monsterMenu.opponent.text.name,
                this.monsterMenu.opponent.text.level
            ];

            if (this.monster.opponent._data.status_problem > 0) {
                console.log("VAI SE FUDER FDP 567890");
                this.monsterMenu.opponent.statusProblem = this.add.sprite(
                    this.monsterMenu.opponent.text.name.x + this.monsterMenu.opponent.text.name.displayWidth + 2,
                    this.monsterMenu.opponent.text.name.y + 3,
                    "status-problem"
                )
                    .setFrame(this.database.status_problem[this.monster.opponent._data.status_problem])
                    .setScrollFactor(0)
                    .setOrigin(0, 0);

                this.monsterMenu.opponent.statusProblem.scale = 0.25;
                this.monsterMenu.opponent.statusProblem.alpha = 0;

                this.containers.interface.add(this.monsterMenu.opponent.statusProblem);
                targets.push(this.monsterMenu.opponent.statusProblem);
            };

            // feida menu do monstro (HP)
            this.tweens.add({
                targets,
                ease: "Linear",
                duration: 800,
                alpha: 1
            });

            // adiciona tween de redimensionar e alpha
            this.tweens.add({
                targets: this.monster.opponent,
                ease: "Linear", 
                duration: 800,
                props: {
                    scaleX: {value: 1},
                    scaleY: {value: 1},
                    alpha: {value: 1}
                },
                onComplete: () => next()
            });
        },
        next => {
            //this.clearMenu();
            //this.insertActionMenu();
            next();
        }

    ], () => callback());
};

// Executar `awake`
Battle.awaked = function (action, callback) {
    let target,
        monsname,
        foe = "";

    // vendo se é monstro do player ou do oponente
    if (action.param.id == this.monster.player._data.id) {
        monsname = this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name;
        target = "player";
    } else if (action.param.id == this.monster.opponent._data.id) {
        monsname = this.monster.opponent._data.nickname || this.database.monsters[this.monster.opponent._data.monsterpedia_id].name;
        target = "opponent";
        foe = "opponent";
    };

    async.series([
        // texto que acordou
        next => {
            this.clearMenu();

            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["statawake" + foe][this.lang], {monster: monsname}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });

            this.monster[target]._data.status_problem = 0;
            this.monsterMenu[target].statusProblem.destroy();

            this.time.addEvent({delay: 2000, callback: next});
        },
        () => callback()
    ]);
};

// Executando param `item_drop`
Battle.dropItem = function (action, index, callback) {
    // actions.regular.push({
    //     fn_name: "item_drop",
    //     param: {
    //         item: data.itemDrop[i].item
    //     }
    // });

    async.series([
        next => {
            this.clearMenu();

            const item = this.database.items[action.param.item].name[this.lang];

            // mostrar texto que ganhou item
            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["gaineditem"][this.lang], {player: "Ivopc", item: item}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });
            
            this.time.addEvent({delay: 2000, callback: next});
        },
        () => callback()
    ]);
};

// Executando param `fainted`, quando algum monstro é derrotado 
Battle.monsterFainted = function (action, index, callback) {

    // se for monstro selvagem
    if (action.param.target == "wild" && this.battleParams.battleInfo.battle_type == 1) {
        let levelup = false;
        async.series([
            // mostrar que monstro adversário desmaiou
            next => {

                this.clearMenu();

                this.removeBuffNerf("opponent", "all");

                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["faintedwild"][this.lang], {monster: this.database.monsters[this.battleParams.wild.monsterpedia_id].name}), {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                });

                this.tweens.add({
                    targets: this.monster.opponent,
                    ease: "Linear", 
                    duration: 1200,
                    props: {
                        scaleX: {value: 0.001},
                        scaleY: {value: 0.001},
                        alpha: {value: 1}
                    }
                });

                this.time.addEvent({delay: 2000, callback: next});
            },
            // Mostrar XP ganho, se upou de lvl ou não
            next => this.giveExpRaw(action.param.reward.exp, next),
            // terminar batalha
            () => this.finishBattle(true)
        ]);
    };

    // se for o jogador contra monstro selvagem ou contra domador (bot)
    if (action.param.target == "player" && (this.battleParams.battleInfo.battle_type == 1 || this.battleParams.battleInfo.battle_type == 2)) {

        async.series([
            // texto de faintou
            next => {
                this.clearMenu();

                this.removeBuffNerf("player", "all");

                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["fainted"][this.lang], {monster: this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name}), {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff"
                });

                this.time.addEvent({delay: 2100, callback: next});
            },
            // animação de faintou
            next => {
                this.tweens.add({
                    targets: this.monster.player,
                    ease: "Linear", 
                    duration: 800,
                    props: {
                        scaleX: {value: 0.001},
                        scaleY: {value: 0.001},
                        alpha: {value: 0}
                    }
                });

                let targets = [
                    this.monsterMenu.player.healthBar.bgSprite, 
                    this.monsterMenu.player.healthBar.barSprite,
                    this.monsterMenu.player.manaBar.bgSprite,
                    this.monsterMenu.player.manaBar.barSprite,
                    this.monsterMenu.player.expBar.bgSprite,
                    this.monsterMenu.player.expBar.barSprite,
                    this.monsterMenu.player.hud,
                    this.monsterMenu.player.text.name,
                    this.monsterMenu.player.text.level
                ];

                if (this.monster.player._data.status_problem > 0) {
                    console.log("VAI SE FUDER FDP TROLOLOL");
                    targets.push(this.monsterMenu.player.statusProblem);
                };

                this.tweens.add({
                    targets,
                    ease: "Linear",
                    duration: 800,
                    alpha: 0
                });

                this.time.addEvent({delay: 1500, callback: next});
            },
            next => {
                // batalha acabou?
                if (action.param.battleEnded) {
                    async.series([
                        _next => {
                            this.clearMenu();

                            // mostrar texto que o player foi derrotado
                            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, this.cache.json.get("language").battle["playerlose"][this.lang], {
                                fontFamily: "Century Gothic", 
                                fontSize: 14, 
                                color: "#fff" 
                            });

                            this.time.addEvent({delay: 2000, callback: _next});
                        },
                        () => this.finishBattle(false)
                    ]);
                } else {
                    this.clearMenu();
                    this.interfacesHandler.party = new Party(this, {type: "defeated"});
                    this.interfacesHandler.party.append();
                };
            }
        ]);
    };

    // se for monstro de domador oponent (bot/npc)
    if (action.param.target == "opponent" && this.battleParams.battleInfo.battle_type == 2) {
        let levelup = false;

        async.series([
            // texto de faintou
            next => {
                this.clearMenu();

                this.removeBuffNerf("opponent", "all");

                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["fainted"][this.lang], {monster: this.monster.opponent._data.nickname || this.database.monsters[this.monster.opponent._data.monsterpedia_id].name}), {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff"
                });

                this.time.addEvent({delay: 2100, callback: next});
            },
            // animação de faintou e retirar menu
            next => {
                this.tweens.add({
                    targets: this.monster.opponent,
                    ease: "Linear", 
                    duration: 800,
                    props: {
                        scaleX: {value: 0.001},
                        scaleY: {value: 0.001},
                        alpha: {value: 0}
                    }
                });

                let targets = [
                    this.monsterMenu.opponent.healthBar.bgSprite, 
                    this.monsterMenu.opponent.healthBar.barSprite,
                    this.monsterMenu.opponent.hud,
                    this.monsterMenu.opponent.text.name,
                    this.monsterMenu.opponent.text.level
                ];

                if (this.monster.opponent._data.status_problem > 0) {
                    console.log("VAI SE FUDER FDP 99");
                    targets.push(this.monsterMenu.opponent.statusProblem);
                };

                this.tweens.add({
                    targets,
                    ease: "Linear",
                    duration: 800,
                    alpha: 0
                });

                this.time.addEvent({delay: 1500, callback: next});
            },
            // Mostrar XP ganho, se upou de lvl ou não
            next => this.giveExpRaw(action.param.reward.exp, next),
            // encerra batalha ou coloca outro monstro
            next => {
                // se a batalha acabou ou não
                if (!action.param.battleEnded) {

                    // criando novo objeto dos monstros do jogador
                    let new_order = _.clone(this.battleParams.tamerMonsters);

                    // trocando monstros de lugar na variável
                    this.battleParams.tamerMonsters.monster0 = new_order["monster" + action.param.changed];
                    this.battleParams.tamerMonsters["monster" + action.param.changed] = new_order.monster0;

                    let monster = this.battleParams.tamerMonsters.monster0;

                    async.series([
                        // texto de trocar monstro
                        _next => {
                            this.clearMenu();

                            // mostrar texto que troca de monstro
                            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["gomonster"][this.lang], {monster: monster.nickname || this.database.monsters[monster.monsterpedia_id].name}), {
                                fontFamily: "Century Gothic", 
                                fontSize: 14, 
                                color: "#fff" 
                            });

                            this.time.addEvent({delay: 900, callback: _next});
                        },
                        // insere monstro novo
                        _next => {

                            const monster_id = monster.monsterpedia_id;

                            // mudar barras (visualmente)
                            this.monsterMenu.opponent.healthBar.setPercentDirectly((monster.current_HP / monster.stats_HP) * 100);

                            this.monster.opponent.destroy();
                            this.monster.opponent = this.add.sprite(
                                315,
                                120,
                                "monster_" + monster_id
                            ).setOrigin(0, 0);

                            this.monster.opponent.flipX = true;

                            this.monster.opponent._data = monster;

                            this.containers.action.add(this.monster.opponent);

                            this.addMonsterAnims(monster_id, this.monster.opponent);
                            this.monster.opponent.anims.play(this.database.battle.sprites[monster_id].name + "_idle");

                            this.containers.action.add(this.monster.opponent);

                            this.monster.opponent.setOrigin(
                                this.database.battle.sprites[monster_id].action.opponent.origin.x, 
                                this.database.battle.sprites[monster_id].action.opponent.origin.y
                            );

                            // seta scale do monstro pro bem minimo
                            this.monster.opponent.scaleX = 0.001;
                            this.monster.opponent.scaleY = 0.001;

                            // seta alpha pra minimo
                            this.monster.opponent.alpha = 0;

                            // limpa textos do menu
                            this.monsterMenu.opponent.text.name.destroy();
                            this.monsterMenu.opponent.text.level.destroy();

                            //if ()

                            // mudar textos
                            this.monsterMenu.opponent.text.name = this.add.text(316, 11, this.monster.opponent._data.nickname || this.database.monsters[this.monster.opponent._data.monsterpedia_id].name, {
                                fontFamily: "Century Gothic", 
                                fontSize: 9, 
                                color: "#000" 
                            }); 

                            this.monsterMenu.opponent.text.level = this.add.text(418, 10, this.monster.opponent._data.level, {
                                fontFamily: "Century Gothic", 
                                fontSize: 9, 
                                color: "#000" 
                            });

                            this.containers.interface.add(this.monsterMenu.opponent.text.name);
                            this.containers.interface.add(this.monsterMenu.opponent.text.level);

                            let targets = [
                                this.monsterMenu.opponent.healthBar.bgSprite, 
                                this.monsterMenu.opponent.healthBar.barSprite,
                                this.monsterMenu.opponent.hud,
                                this.monsterMenu.opponent.text.name,
                                this.monsterMenu.opponent.text.level
                            ];

                            if (this.monster.opponent._data.status_problem > 0) {
                                console.log("VAI SE FUDER KKKK 123");
                                this.monsterMenu.opponent.statusProblem.destroy();
                                this.monsterMenu.opponent.statusProblem = this.add.sprite(
                                    this.monsterMenu.opponent.text.name.x + this.monsterMenu.opponent.text.name.displayWidth + 2,
                                    this.monsterMenu.opponent.text.name.y + 3,
                                    "status-problem"
                                )
                                    .setFrame(this.database.status_problem[this.monster.opponent._data.status_problem])
                                    .setScrollFactor(0)
                                    .setOrigin(0, 0);

                                this.monsterMenu.opponent.statusProblem.scale = 0.25;
                                this.monsterMenu.opponent.statusProblem.alpha = 0;

                                this.containers.interface.add(this.monsterMenu.opponent.statusProblem);
                                targets.push(this.monsterMenu.opponent.statusProblem);
                            };

                            // feida menu do monstro (HP)
                            this.tweens.add({
                                targets,
                                ease: "Linear",
                                duration: 800,
                                alpha: 1
                            });

                            // adiciona tween de redimensionar e alpha
                            this.tweens.add({
                                targets: this.monster.opponent,
                                ease: "Linear", 
                                duration: 800,
                                props: {
                                    scaleX: {value: 1},
                                    scaleY: {value: 1},
                                    alpha: {value: 1}
                                },
                                onComplete: () => _next()
                            });
                        },
                        // insere 
                        _next => {
                            this.clearMenu();
                            this.insertActionMenu();
                        }
                    ], callback);
                } else {
                    // se a batalha acabou

                    async.series([
                        _next => {
                            this.clearMenu();

                            // mostrar texto que domador foi derrotado de monstro
                            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, this.cache.json.get("language").battle["playerwin"][this.lang], {
                                fontFamily: "Century Gothic", 
                                fontSize: 14, 
                                color: "#fff" 
                            });

                            this.time.addEvent({delay: 2000, callback: _next});
                        },
                        // mostrar que ganhou silvers
                        _next => {
                            this.clearMenu();

                            // mostrar texto que ganhou silvers
                            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["rewardsilver"][this.lang], {silvers: action.param.reward.coin}), {
                                fontFamily: "Century Gothic", 
                                fontSize: 14, 
                                color: "#fff" 
                            });

                            this.time.addEvent({delay: 2000, callback: _next});
                        },
                        () => {
                            this.finishBattle(true);
                        }
                    ]);
                };
            }
        ]);
    };

    // se for pvp
    if (this.battleParams.battleInfo.battle_type == 3) {
        
        console.log("LOOOL ABC", this.iAm, action.param.target);

        // se os dois morrerem!
        if (action.param.target == "both") {
            console.log("Eu e o outro player morremos");
            this.bothFaintedPvP(action, callback);
            return;
        };

        // se for o player
        // o monstro player morreu
        if (this.iAm == action.param.target) {

            console.log("Eu morri!");

            async.series([
                // texto de faintou
                next => {
                    this.clearMenu();

                    this.removeBuffNerf("player", "all");

                    this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["fainted"][this.lang], {monster: this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name}), {
                        fontFamily: "Century Gothic", 
                        fontSize: 14, 
                        color: "#fff"
                    });

                    this.time.addEvent({delay: 2100, callback: next});
                },
                // animação de faintou
                next => {
                    this.tweens.add({
                        targets: this.monster.player,
                        ease: "Linear", 
                        duration: 800,
                        props: {
                            scaleX: {value: 0.001},
                            scaleY: {value: 0.001},
                            alpha: {value: 0}
                        }
                    });
                    let targets = [
                        this.monsterMenu.player.healthBar.bgSprite, 
                        this.monsterMenu.player.healthBar.barSprite,
                        this.monsterMenu.player.manaBar.bgSprite,
                        this.monsterMenu.player.manaBar.barSprite,
                        this.monsterMenu.player.expBar.bgSprite,
                        this.monsterMenu.player.expBar.barSprite,
                        this.monsterMenu.player.hud,
                        this.monsterMenu.player.text.name,
                        this.monsterMenu.player.text.level
                    ];

                    if (this.monster.player._data.status_problem > 0) {
                        console.log("VAI SE FUDER FDP 54387689073124");
                        targets.push(this.monsterMenu.player.statusProblem);
                    };

                    // oculta menus
                    this.tweens.add({
                        targets,
                        ease: "Linear",
                        duration: 800,
                        alpha: 0
                    });

                    this.time.addEvent({delay: 1500, callback: next});
                },
                
                next => {
                    // batalha acabou?
                    if (action.param.battleEnded) {
                        async.series([
                            _next => {
                                this.clearMenu();

                                // mostrar texto que o player foi derrotado
                                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, this.cache.json.get("language").battle["playerlose"][this.lang], {
                                    fontFamily: "Century Gothic", 
                                    fontSize: 14, 
                                    color: "#fff" 
                                });

                                this.time.addEvent({delay: 2000, callback: _next});
                            },
                            () => {
                                this.finishBattle(false);
                            }
                        ]);
                    } else {
                        this.clearMenu();
                        this.interfacesHandler.party = new Party(this, {type: "defeated"});
                        this.interfacesHandler.party.append();
                    };
                }
            ]);
        } else {
            // o monstro do oponente morreu
            async.series([
                // texto de q o oponente faintou
                next => {
                    this.clearMenu();

                    this.removeBuffNerf("opponent", "all");

                    this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["fainted"][this.lang], {monster: this.monster.opponent._data.nickname || this.database.monsters[this.monster.opponent._data.monsterpedia_id].name}), {
                        fontFamily: "Century Gothic", 
                        fontSize: 14, 
                        color: "#fff"
                    });

                    this.time.addEvent({delay: 2100, callback: next});
                },
                // animação de faintou
                next => {
                    this.tweens.add({
                        targets: this.monster.opponent,
                        ease: "Linear", 
                        duration: 800,
                        props: {
                            scaleX: {value: 0.001},
                            scaleY: {value: 0.001},
                            alpha: {value: 0}
                        }
                    });

                    let targets = [
                        this.monsterMenu.opponent.healthBar.bgSprite, 
                        this.monsterMenu.opponent.healthBar.barSprite,
                        this.monsterMenu.opponent.hud,
                        this.monsterMenu.opponent.text.name,
                        this.monsterMenu.opponent.text.level
                    ];

                    if (this.monster.opponent._data.status_problem > 0) {
                        console.log("VAI SE FUDER FDP 99");
                        targets.push(this.monsterMenu.opponent.statusProblem);
                    };
                    // oculta menus
                    this.tweens.add({
                        targets,
                        ease: "Linear",
                        duration: 800,
                        alpha: 0
                    });

                    this.time.addEvent({delay: 1500, callback: next});
                },
                // texto de esperando oponente escolher
                next => {
                    // batalha acabou?
                    if (action.param.battleEnded) {
                        async.series([
                            _next => {
                                this.clearMenu();

                                // mostrar texto que o player ganhou a partida
                                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, this.cache.json.get("language").battle["playerwin"][this.lang], {
                                    fontFamily: "Century Gothic", 
                                    fontSize: 14, 
                                    color: "#fff" 
                                });

                                this.time.addEvent({delay: 2000, callback: _next});
                            },
                            () => {
                                this.finishBattle(true);
                            }
                        ]);
                    } else {
                        // se não acabou apenas aguardar outro player escolher
                        this.clearMenu();

                        this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, this.cache.json.get("language").battle["waitchose"][this.lang], {
                            fontFamily: "Century Gothic", 
                            fontSize: 14, 
                            color: "#fff"
                        });
                    }
                }
            ]);

            // se não for o player
            console.log("Não foi eu!");
        };
    };
};

// Executar param `run`
Battle.tryRun = function (action, callback) {
    // se pode fugir
    if (action.param) {

        async.series([
            next => {
                
                this.clearMenu();

                // mostrar texto que pode fugir
                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["run"][this.lang], {monster: this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name}), {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                });

                this.time.addEvent({delay: 2000, callback: next});
            },
            // finaliza batalha
            () => this.finishBattle(true)
        ]);
    } else {
        async.series([
            next => {

                // mostrar texto que naõ pode fugir
                this.clearMenu();

                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["cantrun"][this.lang], {monster: this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name}), {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                });
                this.time.addEvent({delay: 2000, callback: next});
            },
            // ir para próxima função nas ações regulares
            () => callback()
        ])
    };
};

// ** Complementares

// Mostrar que deu EXP e (talvez) upou de level
Battle.giveExpRaw = function (expData, callback) {

    // percorre monstros que receberam XP
    const fns = expData.monsters.map(monster => next => {

        let index = this.getIndexById(monster, this.battleParams.playerMonsters),
            monsterData = this.getMonsterDataById(monster, this.battleParams.playerMonsters),
            levelup;

        async.series([
            // mostrar xp que o monstro ganhou
            _next => {

                this.clearMenu();

                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["gainedxp"][this.lang], {monster: monsterData.nickname || this.database.monsters[monsterData.monsterpedia_id].name, exp: expData.reward}), {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                });

                this.time.addEvent({delay: 400, callback: _next});
            },
            // animação da expbar (se for o primeiro monstro)
            _next => {
                levelup = this.setExpLevelValue(+expData.reward, index);

                if (index == 0)
                    this.monsterMenu.player.expBar.setPercent(this.getExpPercetage(this.monster.player._data), _next);
                else
                    this.time.addEvent({delay: 400, callback: _next});
            },
            // mostrar se upou ou não
            _next => {
                if (levelup) {
                    this.clearMenu();

                    this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["levelup"][this.lang], {monster: monsterData.nickname || this.database.monsters[monsterData.monsterpedia_id].name, level: this.battleParams.playerMonsters["monster" + index].level}), {
                        fontFamily: "Century Gothic", 
                        fontSize: 14, 
                        color: "#fff" 
                    });

                    this.time.addEvent({delay: 2000, callback: _next});
                } else {
                    this.time.addEvent({delay: 1700, callback: _next});
                };
            }
        ], next);
    });

    async.series(fns, callback);
};

// Se errou o hit
Battle.cantHit = function (foe, callback) {
    async.series([   
        next => {
            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["missedattack" + foe][this.lang], {monster: monster_name}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });

            this.time.addEvent({delay: 2000, callback: next});
        },
        () => callback()
    ]);
};

// Se não pode fazer o move
Battle.cantDoMove = function (foe, callback) {
    async.series([
        next => {
            let monsname, currentStatProblem, phrase;

            // vendo se é o player ou oponente
            switch (this.currentMove.attacker) {
                case "player": {
                    monsname = this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name;
                    currentStatProblem = this.monster.player._data.status_problem;
                    break;
                };

                case "opponent": {
                    monsname = this.monster.opponent._data.nickname || this.database.monsters[this.monster.opponent._data.monsterpedia_id].name;
                    currentStatProblem = this.monster.opponent._data.status_problem;
                };
            };

            // separando a frase que será exibida
            switch (currentStatProblem) {
                case 1: {
                    phrase = "statparalyzed";
                    break;
                };
                case 5: {
                    phrase = "statsleeping";
                    break;
                };
            };

            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle[phrase + foe][this.lang], {monster: monsname}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });

            this.time.addEvent({delay: 2000, callback: next});
        },
        () => callback()
    ]);
};

// Trocar monstro derrotado
Battle.changeFaintedMonster = function () {
    // limpa interface
    this.interfacesHandler.party.clear(true);

    // criando novo objeto dos monstros do jogador
    const new_order = _.clone(this.battleParams.playerMonsters);

    // trocando monstros de lugar na variável
    this.battleParams.playerMonsters.monster0 = new_order["monster" + this.currentTradeMonster];
    this.battleParams.playerMonsters["monster" + this.currentTradeMonster] = new_order.monster0;

    const monster = this.battleParams.playerMonsters.monster0;

    //console.log({monster});

    async.series([
        next => {
            this.clearMenu();

            // destruindo sprite antiga
            this.monster.player.destroy();
            this.monsterMenu.player.text.name.destroy();
            this.monsterMenu.player.text.level.destroy();

            if (this.monster.player._data.status_problem > 0) {
                console.log("VAI SE FUDER FDP DEL");
                this.monsterMenu.player.statusProblem.destroy();
            };

            // mostrar texto que troca de monstro
            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["gomonster"][this.lang], {monster: monster.nickname || this.database.monsters[monster.monsterpedia_id].name}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });

            this.time.addEvent({delay: 900, callback: next});

        },
        // insere monstro novo
        next => {

            const monster_id = monster.monsterpedia_id;

            // mudar barras (visualmente)
            this.monsterMenu.player.healthBar.setPercentDirectly((monster.current_HP / monster.stats_HP) * 100);
            this.monsterMenu.player.manaBar.setPercentDirectly((monster.current_MP / monster.stats_MP) * 100);
            this.monsterMenu.player.expBar.setPercentDirectly(this.getExpPercetage(this.monster.player._data));

            this.monster.player = this.add.sprite(
                58,
                120,
                "monster_" + monster_id
            ).setOrigin(0, 0);

            this.monster.player._data = monster;

            // mudar textos
            this.monsterMenu.player.text.name = this.add.text(42, 7, this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name, {
                fontFamily: "Century Gothic", 
                fontSize: 9, 
                color: "#000" 
            }); 

            this.monsterMenu.player.text.level = this.add.text(168, 7, this.monster.player._data.level, {
                fontFamily: "Century Gothic", 
                fontSize: 9, 
                color: "#000" 
            });

            this.containers.interface.add(this.monsterMenu.player.text.name);
            this.containers.interface.add(this.monsterMenu.player.text.level);

            this.addMonsterAnims(monster_id, this.monster.player);
            this.monster.player.anims.play(this.database.battle.sprites[monster_id].name + "_idle");

            this.containers.action.add(this.monster.player);

            this.monster.player.setOrigin(
                this.database.battle.sprites[monster_id].action.player.origin.x, 
                this.database.battle.sprites[monster_id].action.player.origin.y
            );

            // seta scale do monstro pro bem minimo
            this.monster.player.scaleX = 0.001;
            this.monster.player.scaleY = 0.001;

            // seta alpha pra minimo
            this.monster.player.alpha = 0;
            this.monsterMenu.player.text.name.alpha = 0;
            this.monsterMenu.player.text.level.alpha = 0;

            // troca buff/nerf
            this.checkAndAppendBuffNerf(true);

            let targets = [
                this.monsterMenu.player.healthBar.bgSprite, 
                this.monsterMenu.player.healthBar.barSprite,
                this.monsterMenu.player.manaBar.bgSprite,
                this.monsterMenu.player.manaBar.barSprite,
                this.monsterMenu.player.expBar.bgSprite,
                this.monsterMenu.player.expBar.barSprite,
                this.monsterMenu.player.hud,
                this.monsterMenu.player.text.name,
                this.monsterMenu.player.text.level
            ];

            if (this.monster.player._data.status_problem > 0) {
                console.log("VAI SE FUDER FDP 120");
                this.monsterMenu.player.statusProblem = this.add.sprite(
                    this.monsterMenu.player.text.name.x + this.monsterMenu.player.text.name.displayWidth + 2,
                    this.monsterMenu.player.text.name.y + 3,
                    "status-problem"
                )
                    .setFrame(this.database.status_problem[this.monster.player._data.status_problem])
                    .setScrollFactor(0)
                    .setOrigin(0, 0);

                this.monsterMenu.player.statusProblem.scale = 0.25;
                this.monsterMenu.player.statusProblem.alpha = 0;

                this.containers.interface.add(this.monsterMenu.player.statusProblem);
                targets.push(this.monsterMenu.player.statusProblem);
            };


            // feida menu do monstro (HP)
            this.tweens.add({
                targets,
                ease: "Linear",
                duration: 800,
                alpha: 1
            });

            // adiciona tween de redimensionar e alpha
            this.tweens.add({
                targets: this.monster.player,
                ease: "Linear", 
                duration: 800,
                props: {
                    scaleX: {value: 1},
                    scaleY: {value: 1},
                    alpha: {value: 1}
                },
                onComplete: () => next()
            });
        },
        next => {
            this.clearMenu();
            this.insertActionMenu();
        }
    ]);
};

// Trocar monstro derrotado (PvP)
Battle.changeFaintedMonsterPvP = function (action, callback) {

    this.clearMenu();

    // se foi eu o derrotado
    if (this.iAm == action.param.target) {

        console.log("OPA, FOI EU O DERROTADO!");

        this.interfacesHandler.party.clear(true);

        // criando novo objeto dos monstros do jogador
        let new_order = _.clone(this.battleParams.playerMonsters);

        // trocando monstros de lugar na variável
        this.battleParams.playerMonsters.monster0 = new_order["monster" + action.param.monsterPartyIndex];
        this.battleParams.playerMonsters["monster" + action.param.monsterPartyIndex] = new_order.monster0;

        let monster = this.battleParams.playerMonsters.monster0;

        async.series([
            // texto de trocar monstro
            next => {
                this.clearMenu();

                // mostrar texto que troca de monstro
                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["gomonster"][this.lang], {monster: monster.nickname || this.database.monsters[monster.monsterpedia_id].name}), {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                });

                this.time.addEvent({delay: 900, callback: next});
            },
            // insere novo monstro
            next => {
                let monster_id = monster.monsterpedia_id;

                // mudar barras (visualmente)
                this.monsterMenu.player.healthBar.setPercentDirectly((monster.current_HP / monster.stats_HP) * 100);
                this.monsterMenu.player.manaBar.setPercentDirectly((monster.current_MP / monster.stats_MP) * 100);
                this.monsterMenu.player.expBar.setPercentDirectly(this.getExpPercetage(this.monster.player._data));

                this.monster.player = this.add.sprite(
                    58,
                    120,
                    "monster_" + monster_id
                ).setOrigin(0, 0);

                this.monster.player._data = monster;

                // mudar textos
                this.monsterMenu.player.text.name = this.add.text(42, 7, this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name, {
                    fontFamily: "Century Gothic", 
                    fontSize: 9, 
                    color: "#000" 
                }); 

                this.monsterMenu.player.text.level = this.add.text(168, 7, this.monster.player._data.level, {
                    fontFamily: "Century Gothic", 
                    fontSize: 9, 
                    color: "#000" 
                });

                this.containers.interface.add(this.monsterMenu.player.text.name);
                this.containers.interface.add(this.monsterMenu.player.text.level);

                this.monsterMenu.player.text.name.alpha = 0;
                this.monsterMenu.player.text.level.alpha = 0;

                let targets = [
                    this.monsterMenu.player.healthBar.bgSprite, 
                    this.monsterMenu.player.healthBar.barSprite,
                    this.monsterMenu.player.manaBar.bgSprite,
                    this.monsterMenu.player.manaBar.barSprite,
                    this.monsterMenu.player.expBar.bgSprite,
                    this.monsterMenu.player.expBar.barSprite,
                    this.monsterMenu.player.hud,
                    this.monsterMenu.player.text.name,
                    this.monsterMenu.player.text.level
                ];

                if (this.monster.player._data.status_problem > 0) {
                    console.log("VAI SE FUDER FDP 1997");
                    this.monsterMenu.player.statusProblem = this.add.sprite(
                        this.monsterMenu.player.text.name.x + this.monsterMenu.player.text.name.displayWidth + 2,
                        this.monsterMenu.player.text.name.y + 3,
                        "status-problem"
                    )
                        .setFrame(this.database.status_problem[this.monster.player._data.status_problem])
                        .setScrollFactor(0)
                        .setOrigin(0, 0);

                    this.monsterMenu.player.statusProblem.scale = 0.25;
                    this.monsterMenu.player.statusProblem.alpha = 0;

                    this.containers.interface.add(this.monsterMenu.player.statusProblem);
                    targets.push(this.monsterMenu.player.statusProblem);
                };


                this.addMonsterAnims(monster_id, this.monster.player);
                this.monster.player.anims.play(this.database.battle.sprites[monster_id].name + "_idle");

                this.containers.action.add(this.monster.player);

                this.monster.player.setOrigin(
                    this.database.battle.sprites[monster_id].action.player.origin.x, 
                    this.database.battle.sprites[monster_id].action.player.origin.y
                );

                // seta scale do monstro pro bem minimo
                this.monster.player.scaleX = 0.001;
                this.monster.player.scaleY = 0.001;

                // seta alpha pra minimo
                this.monster.player.alpha = 0;

                // troca buff/nerf
                this.checkAndAppendBuffNerf(true);
                // feida menu do monstro (HP)
                this.tweens.add({
                    targets,
                    ease: "Linear",
                    duration: 800,
                    alpha: 1
                });

                // adiciona tween de redimensionar e alpha
                this.tweens.add({
                    targets: this.monster.player,
                    ease: "Linear", 
                    duration: 800,
                    props: {
                        scaleX: {value: 1},
                        scaleY: {value: 1},
                        alpha: {value: 1}
                    },
                    onComplete: () => next()
                });
            }
        ], callback);

        //playerMonsters
    } else {
        //opponentPlayerMonsters
        console.log("OPA, FOI! ELE É O DERROTADO!");

        // criando novo objeto dos monstros do jogador
        let new_order = _.clone(this.battleParams.opponentPlayerMonsters);

        // trocando monstros de lugar na variável
        this.battleParams.opponentPlayerMonsters.monster0 = new_order["monster" + action.param.monsterPartyIndex];
        this.battleParams.opponentPlayerMonsters["monster" + action.param.monsterPartyIndex] = new_order.monster0;

        let monster = this.battleParams.opponentPlayerMonsters.monster0;

        async.series([
            // texto de trocar monstro
            next => {
                this.clearMenu();

                // mostrar texto que troca de monstro
                this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["gomonster"][this.lang], {monster: monster.nickname || this.database.monsters[monster.monsterpedia_id].name}), {
                    fontFamily: "Century Gothic", 
                    fontSize: 14, 
                    color: "#fff" 
                });

                this.time.addEvent({delay: 900, callback: next});
            },
            // insere monstro novo
            next => {

                const monster_id = monster.monsterpedia_id;

                // mudar barras (visualmente)
                this.monsterMenu.opponent.healthBar.setPercentDirectly((monster.current_HP / monster.stats_HP) * 100);

                this.monster.opponent.destroy();
                this.monster.opponent = this.add.sprite(
                    315,
                    120,
                    "monster_" + monster_id
                ).setOrigin(0, 0);

                this.monster.opponent.flipX = true;

                this.monster.opponent._data = monster;

                this.containers.action.add(this.monster.opponent);

                this.addMonsterAnims(monster_id, this.monster.opponent);
                this.monster.opponent.anims.play(this.database.battle.sprites[monster_id].name + "_idle");

                this.containers.action.add(this.monster.opponent);

                this.monster.opponent.setOrigin(
                    this.database.battle.sprites[monster_id].action.opponent.origin.x, 
                    this.database.battle.sprites[monster_id].action.opponent.origin.y
                );

                // seta scale do monstro pro bem minimo
                this.monster.opponent.scaleX = 0.001;
                this.monster.opponent.scaleY = 0.001;

                // seta alpha pra minimo
                this.monster.opponent.alpha = 0;

                // troca buff/nerf
                this.checkAndAppendBuffNerf(true);

                // limpa textos do menu
                this.monsterMenu.opponent.text.name.destroy();
                this.monsterMenu.opponent.text.level.destroy();

                // mudar textos
                this.monsterMenu.opponent.text.name = this.add.text(316, 11, this.monster.opponent._data.nickname || this.database.monsters[this.monster.opponent._data.monsterpedia_id].name, {
                    fontFamily: "Century Gothic", 
                    fontSize: 9, 
                    color: "#000" 
                }); 

                this.monsterMenu.opponent.text.level = this.add.text(418, 10, this.monster.opponent._data.level, {
                    fontFamily: "Century Gothic", 
                    fontSize: 9, 
                    color: "#000" 
                });

                this.monsterMenu.opponent.text.name.alpha = 0;
                this.monsterMenu.opponent.text.level.alpha = 0;

                this.containers.interface.add(this.monsterMenu.opponent.text.name);
                this.containers.interface.add(this.monsterMenu.opponent.text.level);

                let targets = [
                    this.monsterMenu.opponent.healthBar.bgSprite, 
                    this.monsterMenu.opponent.healthBar.barSprite,
                    this.monsterMenu.opponent.hud,
                    this.monsterMenu.opponent.text.name,
                    this.monsterMenu.opponent.text.level
                ];

                if (this.monster.opponent._data.status_problem > 0) {
                    console.log("VAI SE FUDER FDP KRL TYNC");
                    this.monsterMenu.opponent.statusProblem = this.add.sprite(
                        this.monsterMenu.opponent.text.name.x + this.monsterMenu.opponent.text.name.displayWidth + 2,
                        this.monsterMenu.opponent.text.name.y + 3,
                        "status-problem"
                    )
                        .setFrame(this.database.status_problem[this.monster.opponent._data.status_problem])
                        .setScrollFactor(0)
                        .setOrigin(0, 0);

                    this.monsterMenu.opponent.statusProblem.scale = 0.25;
                    this.monsterMenu.opponent.statusProblem.alpha = 0;

                    this.containers.interface.add(this.monsterMenu.opponent.statusProblem);
                    targets.push(this.monsterMenu.opponent.statusProblem);
                };

                // feida menu do monstro (HP)
                this.tweens.add({
                    targets,
                    ease: "Linear",
                    duration: 800,
                    alpha: 1
                });

                // adiciona tween de redimensionar e alpha
                this.tweens.add({
                    targets: this.monster.opponent,
                    ease: "Linear", 
                    duration: 800,
                    props: {
                        scaleX: {value: 1},
                        scaleY: {value: 1},
                        alpha: {value: 1}
                    },
                    onComplete: () => next()
                });
            }
        ], callback);
    };

    //callback();
};

// ambos os monstros desmaiaram (no PvP)
Battle.bothFaintedPvP = function (action, callback) {
    async.series([
        // texto de faintou
        next => {
            this.clearMenu();

            this.removeBuffNerf("player", "all");
            this.removeBuffNerf("opponent", "all");

            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, this.cache.json.get("language").battle["bothfainted"][this.lang], {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff"
            });

            this.time.addEvent({delay: 2100, callback: next});
        },
        // animação de faintou
        next => {
            this.tweens.add({
                targets: [this.monster.player, this.monster.opponent],
                ease: "Linear", 
                duration: 800,
                props: {
                    scaleX: {value: 0.001},
                    scaleY: {value: 0.001},
                    alpha: {value: 0}
                }
            });
            // oculta menus
            this.tweens.add({
                targets: [
                    this.monsterMenu.player.healthBar.bgSprite, 
                    this.monsterMenu.player.healthBar.barSprite,
                    this.monsterMenu.player.manaBar.bgSprite,
                    this.monsterMenu.player.manaBar.barSprite,
                    this.monsterMenu.player.expBar.bgSprite,
                    this.monsterMenu.player.expBar.barSprite,
                    this.monsterMenu.player.hud,
                    this.monsterMenu.player.text.name,
                    this.monsterMenu.player.text.level,
                    this.monsterMenu.opponent.healthBar.bgSprite, 
                    this.monsterMenu.opponent.healthBar.barSprite,
                    this.monsterMenu.opponent.hud,
                    this.monsterMenu.opponent.text.name,
                    this.monsterMenu.opponent.text.level
                ],
                ease: "Linear",
                duration: 800,
                alpha: 0
            });

            this.time.addEvent({delay: 1500, callback: next});
        },
        
        next => {
            // batalha acabou?
            if (action.param.battleEnded) {
                async.series([
                    _next => {
                        this.clearMenu();

                        // mostrar texto que a batalha empatou
                        this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, this.cache.json.get("language").battle["draw"][this.lang], {
                            fontFamily: "Century Gothic", 
                            fontSize: 14, 
                            color: "#fff" 
                        });

                        this.time.addEvent({delay: 2000, callback: _next});
                    },
                    () => {
                        this.finishBattle(false);
                    }
                ]);
            } else {
                this.clearMenu();
                this.interfacesHandler.party = new Party(this, {type: "defeated"});
                this.interfacesHandler.party.append();
            };
        }
    ]);
};

// Descontar HP com poison
Battle.poisonDiscount = function (action, target, callback) {

    let foe = target == "opponent" ? "opponent" : "",
        monster_id, nickname;

    switch (target) {
        case "player": {
            monster_id = this.monster.player._data.monsterpedia_id;
            nickname = this.monster.player._data.nickname;
            break;
        };

        case "opponent": {
            monster_id = this.monster.opponent._data.monsterpedia_id;
            nickname = this.monster.opponent._data.nickname;
            break;
        };
    };

    console.log("IOLAAAAAAAAAA", target);

    async.series([
        next => {
            this.clearMenu();

            // mostrar texto do poison
            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["statpoisoned" + foe][this.lang], {monster: nickname || this.database.monsters[monster_id].name}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });

            this.time.addEvent({delay: 2000, callback: next});
        },
        next => this.discountHealthPoints(action, next, target, true),
        () => callback()
    ]);
};

// Descontar HP
Battle.discountHealthPoints = function (action, next, target, dontNeedToCheckPvPTarget) {

    target = target || action.target.name;
    const hp = {};

    // caso seja PvP ajustar o nome do attacker
    if (this.battleParams.battleInfo.battle_type == 3 && !dontNeedToCheckPvPTarget) {
        if (this.iAm == target) {
            target = "player";
        } else {
            target = "opponent";
        };
    };

    console.log("NEW TARGET", target);

    switch (target) {
        case "player": {
            hp.current = this.monster.player._data.current_HP;
            hp.total = this.monster.player._data.stats_HP;
            let index = this.getFirstPlayerMonsterAliveIndex(this.battleParams.playerMonsters);
            this.battleParams.playerMonsters["monster" + index].current_HP -=  action.param.damage;
            console.log("LOL DESCONTOU", index, hp.current, hp.total, action.param.damage);
            break;
        };

        case "opponent": {
            hp.current = this.monster.opponent._data.current_HP;
            hp.total = this.monster.opponent._data.stats_HP;
            this.monster.opponent._data.current_HP -= action.param.damage;
            break;
        };
    };

    const hpPercetage = ((hp.current - action.param.damage) / hp.total) * 100;

    this.monsterMenu[target].healthBar.setPercent(hpPercetage, next);
};

// Descontar MP
Battle.discountMana = function (action, next) {

    const mp = {};
    mp.current = this.monster.player._data.current_MP;
    mp.total = this.monster.player._data.stats_MP;

    const 
        index = this.getFirstPlayerMonsterAliveIndex(this.battleParams.playerMonsters),
        mana = this.database.moves[action.param.move_id].manaNeeded;

    this.battleParams.playerMonsters["monster" + index].current_MP -= mana;

    this.monsterMenu.player.manaBar.setPercent(
        ((mp.current - action.param.damage) / mp.total) * 100,
        next
    );
};

// Finalizar turno
Battle.finishTurn = function () {

    // se for pvp remover a ampulheta do timer
    if (this.battleParams.battleInfo.battle_type == 3 && this.hasHouglass)
        this.removeTimerHouglass();
    
    // limpa e insere
    this.clearMenu();
    this.insertActionMenu();
};

// Finalizar batalha
Battle.finishBattle = function (playerWins, dontNeedToInjectAction) {

    console.log("FINISH INICIOU");

    // pegar dados do jogador
    this.getPlayerData(data => {

        this.stopScene();

        this.Data.CurrentMap = data.map;
        this.Data.CurrentMonsters = data.monsters;
        this.Data.CurrentItems = data.items;

        let injectedActions;

        // se player perdeu a batalha e se precisa de ações injetáveis
        if (!playerWins && !dontNeedToInjectAction) {
            injectedActions = [];
            injectedActions.push({action: "heal_dialog"});
        };

        // iniciando scene do overworld
        this.scene.start("overworld", {
            // dependencias primárias
            data: this.Data,
            socket: this.Socket,

            // infos do jogador
            auth: this.auth,
            player: {
                sprite: data.sprite,
                position: {
                    facing: data.position.facing,
                    x: Number(data.position.x),
                    y: Number(data.position.y)
                },
                stop: false,
                stepFlag: 0,
                moveInProgress: false
            },

            // se está esperando monstro selvagem e flag do mapa e domadores no mapa e notificação
            wild: null,
            flag: data.flag,
            tamers: data.tamers,
            notify: data.notify,

            // flags especiais
            comeFromBattle: true,

            manager: this.manager,

            // ações injetadas
            injectedActions
        });
    });
};

// ERRO - Quando a ação não pode ser executada
Battle.treatActionError = function (data) {

    // limpar menu
    this.clearMenu();

    switch (+data.error) {
        // Não pode usar essa ação no pvp
        case 1: {
            async.series([
                next => {
                    this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, this.cache.json.get("language").battle["error1"][this.lang], {
                        fontFamily: "Century Gothic", 
                        fontSize: 14, 
                        color: "#fff" 
                    });

                    this.time.addEvent({delay: 1500, callback: next});
                },
                // inserir menu de ação
                () => this.insertActionMenu()
            ]);
            break;
        };
        case 2: {break;};
        // MP insuficiente
        case 3: {
            async.series([
                next => {
                    this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["error3"][this.lang], {monster: this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name}), {
                        fontFamily: "Century Gothic", 
                        fontSize: 14, 
                        color: "#fff" 
                    });

                    this.time.addEvent({delay: 1500, callback: next});
                },
                // inserir menu de ação
                () => this.insertFightMenu()
            ]);
            break;
        };
    }
};

Battle.getExpPercetage = function (monster) {
    const 
        exp = monster.experience,
        level = monster.level;

    const expDatabase = this.cache.json.get("experience");

    const 
        levelTotalCurrent = _.findWhere(expDatabase, {level: level}),
        levelTotalNext = _.findWhere(expDatabase, {level: level + 1});

    const 
        total = levelTotalNext.exp - levelTotalCurrent.exp,
        current = exp - levelTotalCurrent.exp;

    console.log({total, current});

    // 1253/1261

    console.log("EXP %", (current / total) * 100);

    return (current / total) * 100;
};

// pegar estastísticas do EXP
Battle.getExpStatistics = function (exp, level) {

    const expDatabase = this.cache.json.get("experience");

    let levelTotalCurrent = _.findWhere(expDatabase, {level: level}),
        levelTotalNext = _.findWhere(expDatabase, {level: level + 1});

    let total = levelTotalNext.exp - levelTotalCurrent.exp,
        current = exp - levelTotalCurrent.exp;

    console.log({total, current});

    // 1253/1261

    console.log("EXP ", (current / total) * 100, "%");

    return {
        current,
        total,
        nextTotal: levelTotalNext.exp,
        percentage: (current / total) * 100
    };
};

Battle.numberToPedia = function (num) {
    
    num = String(num);

    if (num.length == 1)
        return "00" + num;

    if (num.length == 2)
        return "0" + num;

    return num;
};

Battle.setExpLevelValue = function (earned, index) {
    this.battleParams.playerMonsters["monster" + index].experience += earned;
    const level = this.battleParams.playerMonsters["monster" + index].level;

    const levelTotalNext = _.findWhere(this.cache.json.get("experience"), {
        level: level + 1
    });

    if (this.battleParams.playerMonsters["monster" + index].experience >= levelTotalNext.exp) {
        this.battleParams.playerMonsters["monster" + index].level ++;

        if (index == 0) {
            this.monsterMenu.player.text.level.setText(this.battleParams.playerMonsters["monster" + index].level);
            this.monsterMenu.player.expBar.setPercentDirectly(0);
        };

        return true;
    };

    return false;
};

Battle.removeItem = function (id) {
    // descontar item
    for (let i = 0, l = this.battleParams.items.length; i < l; i ++)
        if (this.battleParams.items[i].item_id == id) {
            --this.battleParams.items[i].amount;

            if (this.battleParams.items[i].amount == 0)
                delete this.battleParams.items[i];
        };
};

Battle.getItems = function () {
    let items = {},
        index = 0,
        arr = [];

    for (let i = 0, l = this.battleParams.items.length; i < l; i ++) {
        if ( !(this.battleParams.items[i].item_id in items) ) {
            items[this.battleParams.items[i].item_id] = {
                item_id: this.battleParams.items[i].item_id,
                amount: this.battleParams.items[i].amount
            };
        } else {
            items[this.battleParams.items[i].item_id].amount += this.battleParams.items[i].amount;
        };
    };

    _.each(items, data => {
        arr[index++] = data;
    });

    return arr;
};

export default Battle;