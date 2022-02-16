import async from "async";
import _ from "underscore";

import Battle from "./index";

// Interfaces
import Party from "@/game-old/interfaces/party";
import Bag from "@/game-old/interfaces/bag";

// Libs próprias
import Button from "@/game-old/plugins/button";
import PointsBar from "@/game-old/plugins/pointsbar";
import ReplacePhrase from "@/game-old/plugins/replacephrase";

// Iniciar apresentação do monstro selvagem
Battle.startWildPresentation = function (callback) {
    // inserir chão (piso)
    const wild_floor_presentation = this.add.sprite(
        189,
        120,
        "floor"
    ).setOrigin(0, 0);
    // adicionar chão ao grupo de ação
    this.containers.action.add(wild_floor_presentation);

    //this.battleParams.wild.monsterpedia_id = 18;

    // pegar id do monstro selvagem
    const wild_id = this.battleParams.wild.monsterpedia_id;

    // appendar monstro selvagem
    this.monster.opponent = this.add.sprite(
        wild_floor_presentation.x,
        wild_floor_presentation.y,
        "monster_" + wild_id
    ).setOrigin(
        this.database.battle.sprites[wild_id].action.opponent.origin.x, 
        this.database.battle.sprites[wild_id].action.opponent.origin.y
    );

    this.monster.opponent._data = this.battleParams.wild;

    this.monster.opponent.flipX = true;

    this.containers.action.add(this.monster.opponent);

    this.addMonsterAnims(wild_id, this.monster.opponent);
    this.monster.opponent.anims.play(this.database.battle.sprites[wild_id].name + "_idle");

    // inicia operações assíncronas
    async.series([
        next => {
            this.tweens.add({
                targets: [wild_floor_presentation, this.monster.opponent],
                ease: "Linear",
                duration: 1500,
                x: 315,
                onComplete: () => next()
            });
        },
        next => {
            // pega nome do monstro
            const monster_name = this.database.monsters[this.battleParams.wild.monsterpedia_id].name;
            
            this.text = [];
            
            //faz texto monstrando que o monstro selvagem apareceu
            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["wildappear"][this.lang], {monster: monster_name}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });

            next();
        },
        next => {

            // adiciona health bar
            this.monsterMenu.opponent.healthBar = new PointsBar(this, {x: 318, y: 22, width: 114, height: 6});
            this.monsterMenu.opponent.healthBar.setPercentDirectly((this.battleParams.wild.current_HP / this.battleParams.wild.stats_HP) * 100);
            
            this.monsterMenu.opponent.hud = this.add.sprite(
                288,
                5,
                "opponent_hud"
            ).setOrigin(0, 0);

            // adiciona os dois ao grupo interface
            this.monsterMenu.opponent.healthBar.setToContainer(this.containers.interface);
            this.containers.interface.add(this.monsterMenu.opponent.hud);

            this.monsterMenu.opponent.text = {};
            this.monsterMenu.opponent.text.name = this.add.text(316, 11, this.database.monsters[this.battleParams.wild.monsterpedia_id].name, {
                fontFamily: "Century Gothic", 
                fontSize: 9, 
                color: "#000" 
            }); 

            this.monsterMenu.opponent.text.level = this.add.text(418, 10, this.battleParams.wild.level, {
                fontFamily: "Century Gothic", 
                fontSize: 9, 
                color: "#000" 
            });

            this.containers.interface.add(this.monsterMenu.opponent.text.name);
            this.containers.interface.add(this.monsterMenu.opponent.text.level);

            // edita o alpha de todo o menu
            this.monsterMenu.opponent.healthBar.bgSprite.alpha = 0;
            this.monsterMenu.opponent.healthBar.barSprite.alpha = 0;
            this.monsterMenu.opponent.hud.alpha = 0;
            this.monsterMenu.opponent.text.name.alpha = 0;
            this.monsterMenu.opponent.text.level.alpha = 0;

            // tweena o menu dos wild
            this.tweens.add({
                targets: [
                    this.monsterMenu.opponent.healthBar.bgSprite, 
                    this.monsterMenu.opponent.healthBar.barSprite,
                    this.monsterMenu.opponent.hud,
                    this.monsterMenu.opponent.text.name,
                    this.monsterMenu.opponent.text.level
                ],
                ease: "Linear",
                duration: 900,
                alpha: 1,
                onComplete: () => {
                    next();
                }
            });
        },
        () => callback()
    ])
};

// Iniciar apresentação do monstro do jogador
Battle.startPlayerPresentation = function (callback) {
    // adiciona "chão" (piso) do jogador
    const playerFloor = this.add.sprite(
        -107,
        120,
        "floor"
    ).setOrigin(0, 0);
    // adiciona personagem (character) do jogador
    const playerCharacter = this.add.sprite(
        -87,
        46,
        "character_battle"
    ).setOrigin(0, 0);

    this.containers.action.add(playerFloor);
    this.containers.action.add(playerCharacter);

    // monstro do jogador
    const monsterPlayer = this.getFirstPlayerMonsterAlive(this.battleParams.playerMonsters);
    //monsterPlayer.monsterpedia_id = 1;

    // inicia operações assincronas
    async.series([
        next => {
            this.tweens.add({
                targets: [playerFloor, playerCharacter],
                ease: "Linear",
                duration: 800,
                x: 58,
                onComplete: () => next()
            });
        },
        next => {
            this.tweens.add({
                targets: playerCharacter,
                ease: "Linear",
                duration: 900,
                x: -80,
                onComplete: () => next()
            });
        },
        next => {
            this.clearMenu();

            // pegar nome do 1º monstro do player
            var monster_name =  monsterPlayer.nickname || this.database.monsters[monsterPlayer.monsterpedia_id].name;

            this.text = [];


            // adiciona texto de vai! {monstro}!
            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["gomonster"][this.lang], {monster: monster_name}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });

            next();
        },
        next => {

            // pegar primeiro monstro alive
            const monsterPlayer = this.getFirstPlayerMonsterAlive(this.battleParams.playerMonsters);

            // pega id do monstro
            const monster_id = monsterPlayer.monsterpedia_id;

            this.monster.player = this.add.sprite(
                playerFloor.x,
                playerFloor.y,
                "monster_" + monster_id
            ).setOrigin(0, 0);

            this.monster.player._data = monsterPlayer;

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

            // window.monster = this.monster.player;

            this.addMonsterAnims(monster_id, this.monster.player);
            this.monster.player.anims.play(this.database.battle.sprites[monster_id].name + "_idle");

            // adiciona tween de redimensionar e alpha
            this.tweens.add({
                targets: this.monster.player,
                ease: "Linear", 
                duration: 800,
                props: {
                    scaleX: {value: 1},
                    scaleY: {value: 1},
                    alpha: {value: 1}
                }
            });

           // adiciona health bar
            this.monsterMenu.player.healthBar = new PointsBar(this, {x: 42, y: 18, width: 114, height: 6});
            this.monsterMenu.player.manaBar = new PointsBar(this, {x: 42, y: 23, width: 111, height: 6, bar: { color: 2730978 }});
            this.monsterMenu.player.expBar = new PointsBar(this, {x: 42, y: 30, width: 78, height: 4, bar: { color: 65535 }});
            // setando valor da porcentagem
            this.monsterMenu.player.healthBar.setPercentDirectly((this.monster.player._data.current_HP / this.monster.player._data.stats_HP) * 100);
            this.monsterMenu.player.manaBar.setPercentDirectly((this.monster.player._data.current_MP / this.monster.player._data.stats_MP) * 100);
            this.monsterMenu.player.expBar.setPercentDirectly(this.getExpPercetage(this.monster.player._data));

            this.monsterMenu.player.hud = this.add.sprite(
                26,
                2,
                "hud"
            ).setOrigin(0, 0);

            // adiciona os dois ao grupo interface
            this.monsterMenu.player.healthBar.setToContainer(this.containers.interface);
            this.monsterMenu.player.manaBar.setToContainer(this.containers.interface);
            this.monsterMenu.player.expBar.setToContainer(this.containers.interface);
            this.containers.interface.add(this.monsterMenu.player.hud);

            this.monsterMenu.player.text = {};

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
            
            // edita o alpha de todo o menu
            this.monsterMenu.player.healthBar.bgSprite.alpha = 0;
            this.monsterMenu.player.healthBar.barSprite.alpha = 0;
            this.monsterMenu.player.manaBar.bgSprite.alpha = 0;
            this.monsterMenu.player.manaBar.barSprite.alpha = 0;
            this.monsterMenu.player.expBar.bgSprite.alpha = 0;
            this.monsterMenu.player.expBar.barSprite.alpha = 0;
            this.monsterMenu.player.hud.alpha = 0;
            this.monsterMenu.player.text.name.alpha = 0;
            this.monsterMenu.player.text.level.alpha = 0;

            const targets = [
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
                console.log("VAI SE FUDER FDP 69");
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
            // tweena o menu dos player
            this.tweens.add({
                targets,
                ease: "Linear",
                duration: 900,
                alpha: 1
            });

            this.time.addEvent({delay: 1500, callback: next});
        },
        () => {
            // limpar menu
            this.clearMenu();
            // inserir menu de ação
            this.insertActionMenu();

            this.buffnerf();

            this.anims.create({
                key: "attack_fireball",
                frames: this.anims.generateFrameNumbers("plasmaball"),
                frameRate: 30,
                repeat: -1
            });

            //this.test();
        }
    ]);
};

// Iniciar apresentação do domador (bot)
Battle.startTamerPresentation = function (callback) {
    // adiciona "chão" (piso) do jogador
    const otherPlayerFloor = this.add.sprite(
        480 + 107,
        120,
        "floor"
    ).setOrigin(0, 0);

    // adiciona personagem (character) do jogador
    const otherPlayerCharacter = this.add.sprite(
        480 + 87,
        46,
        "character_battle"
    ).setOrigin(0, 0);

    otherPlayerCharacter.flipX = true;

    this.containers.action.add(otherPlayerFloor);
    this.containers.action.add(otherPlayerCharacter);

    // monstro do jogador
    const monsterTamerData = this.getFirstPlayerMonsterAlive(this.battleParams.tamerMonsters);

    async.series([
        next => {
            this.tweens.add({
                targets: [otherPlayerFloor, otherPlayerCharacter],
                ease: "Linear",
                duration: 800,
                x: 315,
                onComplete: () => next()
            }); 
        },
        next => {
            this.clearMenu();
            // mostrar texto do player
            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["wouldliketobattle"][this.lang], {character: "Lucas"}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });
            
            this.time.addEvent({delay: 2000, callback: next});
        },
        next => {

            this.clearMenu();
            // mostrar texto q jogou o monstro
            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["sentout"][this.lang], {character: "Lucas", monster: this.database.monsters[monsterTamerData.monsterpedia_id].name}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });
            
            this.time.addEvent({delay: 2000, callback: next});
        },
        next => {
            this.tweens.add({
                targets: otherPlayerCharacter,
                ease: "Linear",
                duration: 900,
                x: 480 + 80,
                onComplete: () => this.time.addEvent({delay: 600, callback: next})
            });
        },
        next => {

            this.clearMenu();

            const opponent_id = monsterTamerData.monsterpedia_id;

            this.monster.opponent = this.add.sprite(
                otherPlayerFloor.x,
                otherPlayerFloor.y,
                "monster_" + opponent_id
            ).setOrigin(0, 0);

            this.monster.opponent._data = monsterTamerData;

            // this.monster.opponent.setTintFill(0xff9955);

            // setTimeout(() => {
            //     this.monster.opponent.clearTint();
            // }, 1500);
            // seta scale do monstro pro bem minimo
            this.monster.opponent.scaleX = 0.001;
            this.monster.opponent.scaleY = 0.001;

            // seta alpha pra minimo
            this.monster.opponent.alpha = 0;

            // adiciona tween de redimensionar e alpha
            this.tweens.add({
                targets: this.monster.opponent,
                ease: "Linear", 
                duration: 800,
                props: {
                    scaleX: {value: 1},
                    scaleY: {value: 1},
                    alpha: {value: 1}
                }
            });
            this.monster.opponent.setOrigin(
                this.database.battle.sprites[opponent_id].action.opponent.origin.x, 
                this.database.battle.sprites[opponent_id].action.opponent.origin.y
            );

            this.monster.opponent.flipX = true;

            this.containers.action.add(this.monster.opponent);

            this.addMonsterAnims(opponent_id, this.monster.opponent);
            this.monster.opponent.anims.play(this.database.battle.sprites[opponent_id].name + "_idle");

            // inserir healthbar  do oponente
            this.monsterMenu.opponent.healthBar = new PointsBar(this, {x: 318, y: 22, width: 114, height: 6});

            // setando HP e MP dos monstros          
            this.monsterMenu.opponent.healthBar.setPercentDirectly((this.monster.opponent._data.current_HP / this.monster.opponent._data.stats_HP) * 100);
            this.monsterMenu.opponent.healthBar.setToContainer(this.containers.interface);

            this.monsterMenu.opponent.hud = this.add.sprite(
                288,
                5,
                "opponent_hud"
            ).setOrigin(0, 0);

            this.containers.interface.add(this.monsterMenu.opponent.hud);

            this.monsterMenu.player.text = {};
            this.monsterMenu.opponent.text = {};

            this.monsterMenu.opponent.text.name = this.add.text(316, 11, this.database.monsters[this.monster.opponent._data.monsterpedia_id].name, {
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

            // edita o alpha de todo o menu
            this.monsterMenu.opponent.healthBar.bgSprite.alpha = 0;
            this.monsterMenu.opponent.healthBar.barSprite.alpha = 0;
            this.monsterMenu.opponent.hud.alpha = 0;
            this.monsterMenu.opponent.text.name.alpha = 0;
            this.monsterMenu.opponent.text.level.alpha = 0;

            // tweena o menu dos player
            this.tweens.add({
                targets: [
                    this.monsterMenu.opponent.healthBar.bgSprite, 
                    this.monsterMenu.opponent.healthBar.barSprite,
                    this.monsterMenu.opponent.hud,
                    this.monsterMenu.opponent.text.name,
                    this.monsterMenu.opponent.text.level
                ],
                ease: "Linear",
                duration: 900,
                alpha: 1
            });

            this.time.addEvent({delay: 1500, callback: next});
        },
        () => callback()
    ]);
};

// Iniciar apresentação do outro jogador (pvp)
Battle.startOtherPlayerPresentation = function (callback) {
    // adiciona "chão" (piso) do jogador
    const otherPlayerFloor = this.add.sprite(
        480 + 107,
        120,
        "floor"
    ).setOrigin(0, 0);

    // adiciona personagem (character) do jogador
    const otherPlayerCharacter = this.add.sprite(
        480 + 87,
        46,
        "character_battle"
    ).setOrigin(0, 0);

    otherPlayerCharacter.flipX = true;

    this.containers.action.add(otherPlayerFloor);
    this.containers.action.add(otherPlayerCharacter);

    // monstro do jogador
    const monsterOtherPlayerData = this.getFirstPlayerMonsterAlive(this.battleParams.opponentPlayerMonsters);
    // var monsterOtherPlayerData = {
    //     monsterpedia_id: 10,
    //     current_HP: 100,
    //     stats_HP: 100
    // };

    async.series([
        next => {
            this.tweens.add({
                targets: [otherPlayerFloor, otherPlayerCharacter],
                ease: "Linear",
                duration: 800,
                x: 315,
                onComplete: () => next()
            }); 
        },
        next => {
            this.clearMenu();
            // mostrar texto do player
            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["wouldliketobattle"][this.lang], {character: this.battleParams.opponentData.nickname}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });
            
            this.time.addEvent({delay: 2000, callback: next});
        },
        next => {

            this.clearMenu();
            // mostrar texto q jogou o monstro
            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["sentout"][this.lang], {character: this.battleParams.opponentData.nickname, monster: monsterOtherPlayerData.nickname || this.database.monsters[monsterOtherPlayerData.monsterpedia_id].name}), {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });
            
            this.time.addEvent({delay: 2000, callback: next});
        },
        next => {
            this.tweens.add({
                targets: otherPlayerCharacter,
                ease: "Linear",
                duration: 900,
                x: 480 + 80,
                onComplete: () => this.time.addEvent({delay: 600, callback: next})
            });
        },
        next => {

            this.clearMenu();

            var opponent_id = monsterOtherPlayerData.monsterpedia_id;

            this.monster.opponent = this.add.sprite(
                otherPlayerFloor.x,
                otherPlayerFloor.y,
                "monster_" + opponent_id
            ).setOrigin(0, 0);

            this.monster.opponent._data = monsterOtherPlayerData;

            // this.monster.opponent.setTintFill(0xff9955);

            // setTimeout(() => {
            //     this.monster.opponent.clearTint();
            // }, 1500);
            // seta scale do monstro pro bem minimo
            this.monster.opponent.scaleX = 0.001;
            this.monster.opponent.scaleY = 0.001;

            // seta alpha pra minimo
            this.monster.opponent.alpha = 0;

            // adiciona tween de redimensionar e alpha
            this.tweens.add({
                targets: this.monster.opponent,
                ease: "Linear", 
                duration: 800,
                props: {
                    scaleX: {value: 1},
                    scaleY: {value: 1},
                    alpha: {value: 1}
                }
            });
            this.monster.opponent.setOrigin(
                this.database.battle.sprites[opponent_id].action.opponent.origin.x, 
                this.database.battle.sprites[opponent_id].action.opponent.origin.y
            );

            this.monster.opponent.flipX = true;

            this.containers.action.add(this.monster.opponent);

            this.addMonsterAnims(opponent_id, this.monster.opponent);
            this.monster.opponent.anims.play(this.database.battle.sprites[opponent_id].name + "_idle");

            // inserir healthbar  do oponente
            this.monsterMenu.opponent.healthBar = new PointsBar(this, {x: 318, y: 22, width: 114, height: 6});

            // setando HP e MP dos monstros          
            this.monsterMenu.opponent.healthBar.setPercentDirectly((this.monster.opponent._data.current_HP / this.monster.opponent._data.stats_HP) * 100);
            this.monsterMenu.opponent.healthBar.setToContainer(this.containers.interface);

            this.monsterMenu.opponent.hud = this.add.sprite(
                288,
                5,
                "opponent_hud"
            ).setOrigin(0, 0);

            this.containers.interface.add(this.monsterMenu.opponent.hud);

            this.monsterMenu.player.text = {};
            this.monsterMenu.opponent.text = {};

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

            // edita o alpha de todo o menu
            this.monsterMenu.opponent.healthBar.bgSprite.alpha = 0;
            this.monsterMenu.opponent.healthBar.barSprite.alpha = 0;
            this.monsterMenu.opponent.hud.alpha = 0;
            this.monsterMenu.opponent.text.name.alpha = 0;
            this.monsterMenu.opponent.text.level.alpha = 0;

            const targets = [
                this.monsterMenu.opponent.healthBar.bgSprite, 
                this.monsterMenu.opponent.healthBar.barSprite,
                this.monsterMenu.opponent.hud,
                this.monsterMenu.opponent.text.name,
                this.monsterMenu.opponent.text.level
            ];

            if (this.monster.opponent._data.status_problem > 0) {
                console.log("VAI SE FUDER FDP");
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

            // tweena o menu dos player
            this.tweens.add({
                targets,
                ease: "Linear",
                duration: 900,
                alpha: 1
            });

            this.time.addEvent({delay: 1500, callback: next});
        },
        () => callback()
    ]);
};

// Iniciar apresentação do campo de batalha
Battle.startFieldPresentation = function (callback) {
    // adiciona sprite de apresentação do field
    const presentation = this.add.sprite(
        0,
        31,
        "presentation"
    ).setOrigin(0, 0);

    // adiciona no grupo de ação
    this.containers.action.add(presentation);

    // adiciona tween
    this.tweens.add({
        targets: presentation,
        ease: "Linear",
        duration: 2000,
        x: "-=480"
    });
};

/* -- apresentação crua (raw) */
// Iniciar apresentação "crua" do monstro selvagem e do jogador
Battle.insertRawPlayerAndWildMonsters = function () {

    var floor = [];
    floor[0] = this.add.sprite(
        58,
        120,
        "floor"
    ).setOrigin(0, 0);

    floor[1] = this.add.sprite(
        315,
        120,
        "floor"
    ).setOrigin(0, 0);

    this.containers.action.add(floor[0]);
    this.containers.action.add(floor[1]);

    var monsterPlayer = this.getFirstPlayerMonsterAlive(this.battleParams.playerMonsters);

    var monster_id = monsterPlayer.monsterpedia_id;

    //monster_id = 7;

    this.monster.player = this.add.sprite(
        floor[0].x,
        floor[0].y,
        "monster_" + monster_id
    ).setOrigin(
        this.database.battle.sprites[monster_id].action.player.origin.x, 
        this.database.battle.sprites[monster_id].action.player.origin.y
    );

    //mons = this.monster.player;

    this.monster.player._data = monsterPlayer;

    console.log("INDEX CRL", this.getIndexById(this.monster.player._data.id, this.battleParams.playerMonsters));

    //window.monster = this.monster.player;

    this.containers.action.add(this.monster.player);

    this.addMonsterAnims(monster_id, this.monster.player);
    this.monster.player.anims.play(this.database.battle.sprites[monster_id].name + "_idle");

    //this.battleParams.wild.monsterpedia_id = 7;

    const wild_id = this.battleParams.wild.monsterpedia_id;

    this.monster.opponent = this.add.sprite(
        floor[1].x,
        floor[1].y,
        "monster_" + wild_id
    ).setOrigin(
        this.database.battle.sprites[wild_id].action.opponent.origin.x, 
        this.database.battle.sprites[wild_id].action.opponent.origin.y
    );

    //opp = this.monster.opponent;

    this.monster.opponent._data = this.battleParams.wild;

    // this.monster.opponent.setTintFill(0xff9955);

    // setTimeout(() => {
    //     this.monster.opponent.clearTint();
    // }, 1500);

    this.monster.opponent.flipX = true;

    this.containers.action.add(this.monster.opponent);

    this.addMonsterAnims(wild_id, this.monster.opponent);
    this.monster.opponent.anims.play(this.database.battle.sprites[wild_id].name + "_idle");

    // inserir healthbar|manapoints|expbar do jogador e healthbar do oponente
    this.monsterMenu.player.healthBar = new PointsBar(this, {x: 42, y: 18, width: 114, height: 6});
    this.monsterMenu.player.manaBar = new PointsBar(this, {x: 42, y: 23, width: 111, height: 6, bar: { color: 2730978 }});
    this.monsterMenu.player.expBar = new PointsBar(this, {x: 42, y: 30, width: 78, height: 4, bar: { color: 65535 }});
    
    this.monsterMenu.opponent.healthBar = new PointsBar(this, {x: 318, y: 22, width: 114, height: 6});

    // setando HP e MP dos monstros
    this.monsterMenu.player.healthBar.setPercentDirectly((this.monster.player._data.current_HP / this.monster.player._data.stats_HP) * 100);
    this.monsterMenu.player.manaBar.setPercentDirectly((this.monster.player._data.current_MP / this.monster.player._data.stats_MP) * 100);
    this.monsterMenu.player.expBar.setPercentDirectly(this.getExpPercetage(this.monster.player._data));
    
    this.monsterMenu.opponent.healthBar.setPercentDirectly((this.monster.opponent._data.current_HP / this.monster.opponent._data.stats_HP) * 100);

    this.monsterMenu.player.healthBar.setToContainer(this.containers.interface);
    this.monsterMenu.player.manaBar.setToContainer(this.containers.interface);
    this.monsterMenu.player.expBar.setToContainer(this.containers.interface);
    
    this.monsterMenu.opponent.healthBar.setToContainer(this.containers.interface);

    this.monsterMenu.player.hud = this.add.sprite(
        26,
        2,
        "hud"
    ).setOrigin(0, 0);

    this.monsterMenu.opponent.hud = this.add.sprite(
        288,
        5,
        "opponent_hud"
    ).setOrigin(0, 0);

    this.containers.interface.add(this.monsterMenu.player.hud);
    this.containers.interface.add(this.monsterMenu.opponent.hud);

    this.monsterMenu.player.text = {};
    this.monsterMenu.opponent.text = {};
    
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

    this.monsterMenu.opponent.text.name = this.add.text(316, 11, this.database.monsters[wild_id].name, {
        fontFamily: "Century Gothic", 
        fontSize: 9, 
        color: "#000" 
    });

    this.monsterMenu.opponent.text.level = this.add.text(418, 10, this.monster.opponent._data.level, {
        fontFamily: "Century Gothic", 
        fontSize: 9, 
        color: "#000" 
    });

    this.containers.interface.add(this.monsterMenu.player.text.name);
    this.containers.interface.add(this.monsterMenu.player.text.level);
    this.containers.interface.add(this.monsterMenu.opponent.text.name);
    this.containers.interface.add(this.monsterMenu.opponent.text.level);

    if (this.monster.player._data.status_problem > 0) {
        console.log("VAI SE FUDER FDP 45");
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

    if (this.monster.opponent._data.status_problem > 0) {
        console.log("VAI SE FUDER FDP 49");
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
    };
    //this.text(monster_id)

    // inserir menu de ação
    this.insertActionMenu();

    this.anims.create({
        key: "attack_fireball",
        frames: this.anims.generateFrameNumbers("plasmaball"),
        frameRate: 30,
        repeat: -1
    });

    this.buffnerf();

    //this.test();
};

// Iniciar apresentação "crua" do monstro do jogador e do domador (bot)
Battle.insertRawPlayerVsTamer = function () {
    var floor = [];
    floor[0] = this.add.sprite(
        58,
        120,
        "floor"
    ).setOrigin(0, 0);

    floor[1] = this.add.sprite(
        315,
        120,
        "floor"
    ).setOrigin(0, 0);

    this.containers.action.add(floor[0]);
    this.containers.action.add(floor[1]);

    var monsterPlayer = this.getFirstPlayerMonsterAlive(this.battleParams.playerMonsters);

    var monster_id = monsterPlayer.monsterpedia_id;

    //var monster_id = "dinnox";

    this.monster.player = this.add.sprite(
        floor[0].x,
        floor[0].y,
        "monster_" + monster_id
    ).setOrigin(0, 0);

    this.monster.player._data = monsterPlayer;

    //console.log("INDEX CRL", this.getIndexById(this.monster.player._data.id, this.battleParams.playerMonsters));

    this.monster.player.setOrigin(
        this.database.battle.sprites[monster_id].action.player.origin.x, 
        this.database.battle.sprites[monster_id].action.player.origin.y
    );

    //window.monster = this.monster.player;

    this.containers.action.add(this.monster.player);
    this.addMonsterAnims(monster_id, this.monster.player);
    this.monster.player.anims.play(this.database.battle.sprites[monster_id].name + "_idle");

    var tamerMonster = this.getFirstPlayerMonsterAlive(this.battleParams.tamerMonsters),
        opponent_id = tamerMonster.monsterpedia_id;

    this.monster.opponent = this.add.sprite(
        floor[1].x,
        floor[1].y,
        "monster_" + opponent_id
    ).setOrigin(0, 0);

    this.monster.opponent._data = tamerMonster;

    // this.monster.opponent.setTintFill(0xff9955);
    // setTimeout(() => {
    //     this.monster.opponent.clearTint();
    // }, 1500);

    this.monster.opponent.setOrigin(
        this.database.battle.sprites[opponent_id].action.opponent.origin.x, 
        this.database.battle.sprites[opponent_id].action.opponent.origin.y
    );

    this.monster.opponent.flipX = true;

    this.containers.action.add(this.monster.opponent);

    this.addMonsterAnims(opponent_id, this.monster.opponent);
    this.monster.opponent.anims.play(this.database.battle.sprites[opponent_id].name + "_idle");

    // inserir healthbar|manapoints|expbar do jogador e healthbar do oponente
    this.monsterMenu.player.healthBar = new PointsBar(this, {x: 42, y: 18, width: 114, height: 6});
    this.monsterMenu.player.manaBar = new PointsBar(this, {x: 42, y: 23, width: 111, height: 6, bar: { color: 2730978 }});
    this.monsterMenu.player.expBar = new PointsBar(this, {x: 42, y: 30, width: 78, height: 4, bar: { color: 65535 }});
    
    this.monsterMenu.opponent.healthBar = new PointsBar(this, {x: 318, y: 22, width: 114, height: 6});

    // setando HP e MP dos monstros
    this.monsterMenu.player.healthBar.setPercentDirectly((this.monster.player._data.current_HP / this.monster.player._data.stats_HP) * 100);
    this.monsterMenu.player.manaBar.setPercentDirectly((this.monster.player._data.current_MP / this.monster.player._data.stats_MP) * 100);
    this.monsterMenu.player.expBar.setPercentDirectly(this.getExpPercetage(this.monster.player._data));
    
    this.monsterMenu.opponent.healthBar.setPercentDirectly((this.monster.opponent._data.current_HP / this.monster.opponent._data.stats_HP) * 100);

    this.monsterMenu.player.healthBar.setToContainer(this.containers.interface);
    this.monsterMenu.player.manaBar.setToContainer(this.containers.interface);
    this.monsterMenu.player.expBar.setToContainer(this.containers.interface);
    
    this.monsterMenu.opponent.healthBar.setToContainer(this.containers.interface);

    this.monsterMenu.player.hud = this.add.sprite(
        26,
        2,
        "hud"
    ).setOrigin(0, 0);

    this.monsterMenu.opponent.hud = this.add.sprite(
        288,
        5,
        "opponent_hud"
    ).setOrigin(0, 0);

    this.containers.interface.add(this.monsterMenu.player.hud);
    this.containers.interface.add(this.monsterMenu.opponent.hud);

    this.monsterMenu.player.text = {};
    this.monsterMenu.opponent.text = {};
    
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

    this.monsterMenu.opponent.text.name = this.add.text(316, 11, this.database.monsters[this.monster.opponent._data.monsterpedia_id].name, {
        fontFamily: "Century Gothic", 
        fontSize: 9, 
        color: "#000" 
    });

    this.monsterMenu.opponent.text.level = this.add.text(418, 10, this.monster.opponent._data.level, {
        fontFamily: "Century Gothic", 
        fontSize: 9, 
        color: "#000" 
    });

    this.containers.interface.add(this.monsterMenu.player.text.name);
    this.containers.interface.add(this.monsterMenu.player.text.level);
    this.containers.interface.add(this.monsterMenu.opponent.text.name);
    this.containers.interface.add(this.monsterMenu.opponent.text.level);
    //this.text(monster_id)

    if (this.monster.player._data.status_problem > 0) {
        console.log("VAI SE FUDER FDP 45");
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

    if (this.monster.opponent._data.status_problem > 0) {
        console.log("VAI SE FUDER FDP 49");
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
    };

    // inserir menu de ação
    this.insertActionMenu();


    this.anims.create({
        key: "attack_fireball",
        frames: this.anims.generateFrameNumbers("plasmaball"),
        frameRate: 30,
        repeat: -1
    });

    this.buffnerf();
};

// Iniciar apresentação "crua" do monstro do player e do outro player (PvP)
Battle.insertRawPlayerVersusPlayer = function () {

    var floor = [];
    floor[0] = this.add.sprite(
        58,
        120,
        "floor"
    ).setOrigin(0, 0);

    floor[1] = this.add.sprite(
        315,
        120,
        "floor"
    ).setOrigin(0, 0);

    this.containers.action.add(floor[0]);
    this.containers.action.add(floor[1]);

    var monsterPlayer = this.getFirstPlayerMonsterAlive(this.battleParams.playerMonsters);

    var monster_id = monsterPlayer.monsterpedia_id;

    //var monster_id = "dinnox";

    this.monster.player = this.add.sprite(
        floor[0].x,
        floor[0].y,
        "monster_" + monster_id
    ).setOrigin(0, 0);

    this.monster.player._data = monsterPlayer;

    //console.log("INDEX CRL", this.getIndexById(this.monster.player._data.id, this.battleParams.playerMonsters));

    this.monster.player.setOrigin(
        this.database.battle.sprites[monster_id].action.player.origin.x, 
        this.database.battle.sprites[monster_id].action.player.origin.y
    );

    //window.monster = this.monster.player;

    this.containers.action.add(this.monster.player);
    this.addMonsterAnims(monster_id, this.monster.player);
    this.monster.player.anims.play(this.database.battle.sprites[monster_id].name + "_idle");


    var otherMonsterPlayer = this.getFirstPlayerMonsterAlive(this.battleParams.opponentPlayerMonsters),
        opponent_id = otherMonsterPlayer.monsterpedia_id;

    this.monster.opponent = this.add.sprite(
        floor[1].x,
        floor[1].y,
        "monster_" + opponent_id
    ).setOrigin(0, 0);

    this.monster.opponent._data = otherMonsterPlayer;

    // this.monster.opponent.setTintFill(0xff9955);

    // setTimeout(() => {
    //     this.monster.opponent.clearTint();
    // }, 1500);

    this.monster.opponent.setOrigin(
        this.database.battle.sprites[opponent_id].action.opponent.origin.x, 
        this.database.battle.sprites[opponent_id].action.opponent.origin.y
    );

    this.monster.opponent.flipX = true;

    this.containers.action.add(this.monster.opponent);

    this.addMonsterAnims(opponent_id, this.monster.opponent);
    this.monster.opponent.anims.play(this.database.battle.sprites[opponent_id].name + "_idle");

    // inserir healthbar|manapoints|expbar do jogador e healthbar do oponente
    this.monsterMenu.player.healthBar = new PointsBar(this, {x: 42, y: 18, width: 114, height: 6});
    this.monsterMenu.player.manaBar = new PointsBar(this, {x: 42, y: 23, width: 111, height: 6, bar: { color: 2730978 }});
    this.monsterMenu.player.expBar = new PointsBar(this, {x: 42, y: 30, width: 78, height: 4, bar: { color: 65535 }});
    
    this.monsterMenu.opponent.healthBar = new PointsBar(this, {x: 318, y: 22, width: 114, height: 6});

    // setando HP e MP dos monstros
    this.monsterMenu.player.healthBar.setPercentDirectly((this.monster.player._data.current_HP / this.monster.player._data.stats_HP) * 100);
    this.monsterMenu.player.manaBar.setPercentDirectly((this.monster.player._data.current_MP / this.monster.player._data.stats_MP) * 100);
    this.monsterMenu.player.expBar.setPercentDirectly(this.getExpPercetage(this.monster.player._data));
    
    this.monsterMenu.opponent.healthBar.setPercentDirectly((this.monster.opponent._data.current_HP / this.monster.opponent._data.stats_HP) * 100);

    this.monsterMenu.player.healthBar.setToContainer(this.containers.interface);
    this.monsterMenu.player.manaBar.setToContainer(this.containers.interface);
    this.monsterMenu.player.expBar.setToContainer(this.containers.interface);
    
    this.monsterMenu.opponent.healthBar.setToContainer(this.containers.interface);

    this.monsterMenu.player.hud = this.add.sprite(
        26,
        2,
        "hud"
    ).setOrigin(0, 0);

    this.monsterMenu.opponent.hud = this.add.sprite(
        288,
        5,
        "opponent_hud"
    ).setOrigin(0, 0);

    this.containers.interface.add(this.monsterMenu.player.hud);
    this.containers.interface.add(this.monsterMenu.opponent.hud);

    this.monsterMenu.player.text = {};
    this.monsterMenu.opponent.text = {};

    
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

    this.containers.interface.add(this.monsterMenu.player.text.name);
    this.containers.interface.add(this.monsterMenu.player.text.level);
    this.containers.interface.add(this.monsterMenu.opponent.text.name);
    this.containers.interface.add(this.monsterMenu.opponent.text.level);
    //this.text(monster_id)

    if (this.monster.player._data.status_problem > 0) {
        console.log("VAI SE FUDER FDP 45");
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

    if (this.monster.opponent._data.status_problem > 0) {
        console.log("VAI SE FUDER FDP 49");
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
    };

    // inserir menu de ação
    this.insertActionMenu();

    this.anims.create({
        key: "attack_fireball",
        frames: this.anims.generateFrameNumbers("plasmaball"),
        frameRate: 30,
        repeat: -1
    });

    this.buffnerf();
};

// Finalizar PvP com animação
Battle.endPvP = function (callback, winner_uid) {
    /*
        hidar monster(menu) do player e do oponente ->
        mostrar texto de quem ganhou ->
    */

    winner_uid = +winner_uid;

    async.series([
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

            const targets = [
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
            ];

            if (this.monster.player._data.status_problem > 0) {
                console.log("VAI SE FUDER FDP 88");
                targets.push(this.monsterMenu.player.statusProblem);
            };

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
        next => {
            let winner = winner_uid == this.auth.uid ? "pvpplayerwin" : "pvpopponentwin";
            // mostrar texto que troca de monstro
            this.clearMenu();

            this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, this.cache.json.get("language").battle[winner][this.lang], {
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });

            this.time.addEvent({delay: 2500, callback: next});
        },
        () => callback(null, winner_uid == this.auth.uid)
    ]);
};

// Inserir botões de ação do menu
Battle.insertActionMenu = function () {

    this.clearMenu();

    this.butt = [];
    this.text = [];

    // ** botões de ação
    
    // movimentos (batalha) 
    this.butt[0] = new Button(this, {
        x: 268,
        y: 166,
        spritesheet: "button_new",
        on: {
            click: () => this.insertFightMenu()
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    // mochila
    this.butt[1] = new Button(this, {
        x: 371,
        y: 166,
        spritesheet: "button_new",
        on: {
            click: () => {

                // se for pvp não deixa o player escolher essa ação
                if (this.battleParams.battleInfo.battle_type == 3) {
                    this.treatActionError({error: 1});
                    return;
                };

                this.insertItemsMenu();
            }
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    // bracelete (monstros)
    this.butt[2] = new Button(this, {
        x: 268,
        y: 200,
        spritesheet: "button_new",
        on: {
            click: () => this.insertPartyMenu()
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });
    // fugir 
    this.butt[3] = new Button(this, {
        x: 371,
        y: 200,
        spritesheet: "button_new",
        on: {
            click: () => this.sendRun()
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });

    // textos dos botões de ação
    this.text[0] = this.add.text(0, 0, this.cache.json.get("language").battle["btnbattle"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 15, 
        color: "#fff" 
    });
    this.text[1] = this.add.text(0, 0, this.cache.json.get("language").battle["btnbag"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 15, 
        color: "#fff" 
    });
    this.text[2] = this.add.text(0, 0, this.cache.json.get("language").battle["btnmonsters"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 15, 
        color: "#fff" 
    });
    this.text[3] = this.add.text(0, 0, this.cache.json.get("language").battle["btnrun"][this.lang], { 
        fontFamily: "Century Gothic", 
        fontSize: 15, 
        color: "#fff" 
    });

    // centralizando textos de acordo com sprite do botão 
    // thanks: http://www.html5gamedevs.com/topic/40451-bubble-dialog-with-text-centered-container-phaser-3140/
    for (let i = 0; i < 4; i ++) {
        this.text[i].setOrigin(0.5);
        this.text[i].setX(this.butt[i].sprite.getCenter().x);
        this.text[i].setY(this.butt[i].sprite.getCenter().y);
    };

    // o que {monster} irá fazer?
    // ReplacePhrase(this.cache.json.get("language").battle["whatwilldo"][this.lang], {monster: this.database.monsters[this.battleParams.playerMonsters.monster0.monsterpedia_id]})
    this.text[4] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, ReplacePhrase(this.cache.json.get("language").battle["whatwilldo"][this.lang], {monster: this.monster.player._data.nickname || this.database.monsters[this.monster.player._data.monsterpedia_id].name}), {
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    });
    // txt.setOrigin(0.5);
    // txt.setX(barSprite.getCenter().x);
    // txt.setY(barSprite.getCenter().y);
};

// Inserir botões dos movimentos do menu
Battle.insertFightMenu = function () {
    this.clearMenu();
    
    this.butt = [];
    this.text = [];

    // botões dos moves
    this.butt[0] = new Button(this, {
        x: 12,
        y: 166,
        spritesheet: "button_new",
        on: {
            click: () => this.sendMove(0)
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });

    this.butt[1] = new Button(this, {
        x: 115,
        y: 166,
        spritesheet: "button_new",
        on: {
            click: () => this.sendMove(1)
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });

    this.butt[2] = new Button(this, {
        x: 12,
        y: 200,
        spritesheet: "button_new",
        on: {
            click: () => this.sendMove(2)
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });

    this.butt[3] = new Button(this, {
        x: 115,
        y: 200,
        spritesheet: "button_new",
        on: {
            click: () => this.sendMove(3)
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    });

    //this.butt[3].sprite.input.enabled = false;
    // insere textos dos botões
    for (let i = 0; i < 4; i++) {

        const move = this.monster.player._data["move_" + (i)];
        // se tiver algum move
        if (move > 0) {
            this.text[i] = this.add.text(0, 0, this.database.moves[move].name[this.lang], { 
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });
        } else {
            // insere texto vazio
            this.text[i] = this.add.text(0, 0, "-", { 
                fontFamily: "Century Gothic", 
                fontSize: 14, 
                color: "#fff" 
            });
            this.butt[i].sprite.input.enabled = false;
        };

        // centralizando textos de acordo com sprite do botão 
        this.text[i].setOrigin(0.5);
        this.text[i].setX(this.butt[i].sprite.getCenter().x);
        this.text[i].setY(this.butt[i].sprite.getCenter().y);
    };

    this.butt[4] = new Button(this, {
        x: 343,
        y: 185,
        spritesheet: "button_back",
        on: {
            click: () => this.insertActionMenu()
        },
        frames: {click: 1, over: 2, up: 0, out: 0}
    })
};

// Inserir menu de monstros
Battle.insertPartyMenu = function () {

    this.clearMenu();

    this.interfacesHandler.party = new Party(this, {type: "battleParty"});
    this.interfacesHandler.party.append();
};

// Inserir menu dos itens
Battle.insertItemsMenu = function () {
    this.interfacesHandler.bag = new Bag(this);
    this.interfacesHandler.bag.append();
};

// (método principal) excluir interfaces de maneira genérica
Battle.clearInterface = function () {
    _.each(this.btn, btn => btn.sprite.destroy());
    _.each(this.text, text => text.destroy());

    this.btn = {};
    this.text = {};
};

// Limpar menu da batalha
Battle.clearMenu = function () {

    this.butt = this.butt || [];
    this.text = this.text || [];

    for (let i = 0, l = this.butt.length; i < l; i++)
        this.butt[i].sprite.destroy();

    if (_.isObject(this.text)) {
        _.each(this.text, el => el.destroy());
    } else {
        for (let i = 0, l = this.text.length; i < l; i++)
            this.text[i].destroy();
    };


    this.butt = [];
    this.text = [];
};

Battle.disableEnableButtons = function (bool) {
    for (let i = 0, l = this.butt.length; i < l; i++)
        this.butt[i].sprite.input.enabled = bool;
};

// adicionar animações do monstro ao gameobject
Battle.addMonsterAnims = function (monster_id, gameobject) {

    var in_db_data = this.database.battle.sprites[monster_id],
        name = in_db_data.name;

   var frames = [];

   console.log({monster_id, name, gameobject});

    for (let i = 0; i < in_db_data.animation.idle; i++) {
        frames[i] = {
            key: in_db_data.atlas,
            frame: name + "_idle" + (i)
        };
    };

    this.anims.create({
        key: name + "_idle",
        frames,
        frameRate: in_db_data.framerate.idle,
        repeat: -1
    });

    gameobject.anims.load(name + "_idle");

    var frames = [];

    for (let i = 0; i < in_db_data.animation.physicalattack; i++) {
        frames[i] = {
            key: in_db_data.atlas,
            frame: name + "_physicalattack" + (i)
        };
    };

    this.anims.create({
        key: name + "_physicalattack",
        frames,
        frameRate: in_db_data.framerate.physicalattack,
        repeat: 0
    });

    gameobject.anims.load(name + "_physicalattack");

    gameobject.on("animationcomplete", function (anim, frame) {
        this.emit("anim_" + anim.key.split("_")[1], anim, frame);
    });

    gameobject.on("anim_physicalattack", function () {
        this.anims.play(name + "_idle");
    });
};

Battle.moves = {
    player: {},
    opponent: {}
};

Battle.moves.player[1] = function (callback) {

    var monster_id = this.monster.player._data.monsterpedia_id,
        name = this.database.battle.sprites[monster_id].name;

    var particles = this.add.particles("firesheet");

    this.containers.action.add(particles);

    var emitter = particles.createEmitter({
        frame: [0, 1, 2, 3],
        lifespan: 400,
        speed: { min: 100, max: 200 },
        angle: -180,
        gravityY: 300,
        scale: { start: 0.6, end: 1 },
        quantity: 1
    });

    var sprite = this.add.sprite(100, 100, "plasmaball");
    sprite.anims.load("attack_fireball");
    sprite.anims.play("attack_fireball");

    emitter.startFollow(sprite);

    this.monster.player.anims.play(name + "_physicalattack");

    this.tweens.add({
        targets: sprite,
        ease: "Linear", 
        duration: 1000,
        x: "+=255",
        onComplete: () => {
            sprite.destroy();
            particles.destroy();
            callback();
        }
    });
};

Battle.moves.player[2] = function (callback) {

    const 
        monster_id = this.monster.player._data.monsterpedia_id,
        name = this.database.battle.sprites[monster_id].name;

    this.monster.player.anims.play(name + "_physicalattack");

    const particles = this.add.particles("flares");

    particles.createEmitter({
        frame: "green",
        x: this.monster.opponent.getCenter().x, y: this.monster.opponent.getCenter().y,
        lifespan: { min: 600, max: 800 },
        angle: { start: 0, end: 360, steps: 64 },
        speed: 100,
        quantity: 64,
        scale: { start: 0.2, end: 0.1 },
        frequency: 32
    });

    this.containers.preAction.add(particles);

    this.time.addEvent({
        delay: 2000, 
        callback: () => {
            particles.destroy();
            callback();
        }
    });
};

Battle.moves.player[3] = function (callback) {
    callback();
};

Battle.moves.player[4] = function (callback) {
    callback();
};

Battle.moves.player[5] = function (callback) {
    callback();
};

Battle.moves.opponent[1] = function (callback) {

    var monster_id = this.monster.opponent._data.monsterpedia_id,
        name = this.database.battle.sprites[monster_id].name;

   var particles = this.add.particles("firesheet");

   this.containers.action.add(particles);

    var emitter = particles.createEmitter({
        frame: [3, 2, 1, 0],
        lifespan: 400,
        speed: { min: 100, max: 200 },
        angle: 180,
        gravityY: 300,
        scale: { start: 0.6, end: 1 },
        quantity: 1
    });

    var sprite = this.add.sprite(365, 100, "plasmaball");

    sprite.anims.load("attack_fireball");
    sprite.anims.play("attack_fireball");

    emitter.startFollow(sprite);

    this.monster.opponent.anims.play(name + "_physicalattack");

    this.tweens.add({
        targets: sprite,
        ease: "Linear",
        duration: 1000,
        x: "-=255",
        onComplete: () => {
            sprite.destroy();
            particles.destroy();
            callback();
        }
    });
};

Battle.moves.opponent[2] = function (callback) {
    //callback();
    console.log("HOLA PORRA");
    this.time.addEvent({delay: 2000, callback: callback});
    //setTimeout(callback, 3000);
};

Battle.moves.opponent[3] = function (callback) {
    callback();
};

Battle.moves.opponent[4] = function (callback) {
    callback();
};

Battle.moves.opponent[5] = function (callback) {
    callback();
};

Battle.weather = {};

// chuva
Battle.weather.rain = function () {
    const par = this.add.particles("rain", [
        {
            angle: { min: 0, max: 360 },
            // emitZone: { source: offscreen },
            // deathZone: { source: screen, type: "onLeave" },
            frequency: 60,
            speedY: { min: 300, max: 900 },
            x: {min: 0, max: this.sys.game.canvas.width},
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
            x: {min: 0, max: this.sys.game.canvas.width},
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
            x: {min: 0, max: this.sys.game.canvas.width},
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
            x: {min: 0, max: this.sys.game.canvas.width},
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
            x: {min: 0, max: this.sys.game.canvas.width},
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
            x: {min: 0, max: this.sys.game.canvas.width},
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
            x: {min: 0, max: this.sys.game.canvas.width},
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
            x: {min: 0, max: this.sys.game.canvas.width},
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
            x: {min: 0, max: this.sys.game.canvas.width},
            lifespan: Infinity,
            radial: true,
            rotation: 180,
            scale: 0.15
        }
    ]);

    this.containers.action.add(par);
};

Battle.convertNumberToBuffNerfText = num => num > 0 ? "+" + num : String(num);

Battle.buffnerf = function () {
    const grphc = this.add.graphics({
        lineStyle: {
            color: 0xFFFFFF,
            alpha: 1
        },
        fillStyle: {
            color: 0x000000,
            alpha: 0.2
        }
    });

    const rect = {
        x: 0,
        y: 0,
        width: this.database.interface.battle.statchange.size.width,
        height: this.database.interface.battle.statchange.size.height
    };

    grphc.fillRectShape(rect); // rect: {x, y, width, height}
    grphc.fillRect(rect.x, rect.y, rect.width, rect.height);
    grphc.strokeRectShape(rect);  // rect: {x, y, width, height}
    grphc.strokeRect(rect.x, rect.y, rect.width, rect.height);
    grphc.generateTexture("buff_nerf_bar");

    grphc.destroy();

    this.monsterMenu.player.statChange = {};
    this.monsterMenu.player.statChange.atk = {};
    this.monsterMenu.player.statChange.def = {};
    this.monsterMenu.player.statChange.spe = {};
    this.monsterMenu.player.statChange.acc = {};
    this.monsterMenu.player.statChange.eva = {};

    this.monsterMenu.opponent.statChange = {};
    this.monsterMenu.opponent.statChange.atk = {};
    this.monsterMenu.opponent.statChange.def = {};
    this.monsterMenu.opponent.statChange.spe = {};
    this.monsterMenu.opponent.statChange.acc = {};
    this.monsterMenu.opponent.statChange.eva = {};

    this.checkAndAppendBuffNerf();

    // this.appendUpdateBuffNerf("player", "def", -3);
    // this.appendUpdateBuffNerf("opponent", "acc", 3);
};

// checar se tem buff nerf e apprendar
Battle.checkAndAppendBuffNerf = function (clear) {
    const buff_nerf = this.battleParams.battleInfo.buff_nerf;

    if (clear) {
        this.removeBuffNerf("player", "all");
        this.removeBuffNerf("opponent", "all");
    };

    if (buff_nerf && buff_nerf.length > 0) {
        for (let i = 0; i < buff_nerf.length; i ++) {
            if (buff_nerf[i].affected_monster == this.monster.player._data.id) {
                this.appendUpdateBuffNerf("player", this.database.battle.statchange[buff_nerf[i].stats_affected], buff_nerf[i].value);
            } else if (buff_nerf[i].affected_monster == this.monster.opponent._data.id) {
                this.appendUpdateBuffNerf("opponent", this.database.battle.statchange[buff_nerf[i].stats_affected], buff_nerf[i].value);
            };
        };
    };
};

// inserir buff/nerf do stat
Battle.appendUpdateBuffNerf = function (target, stat, value) {

    // se já existe, só manda atualizar
    if (this.monsterMenu[target].statChange[stat].has) {
        this.monsterMenu[target].statChange[stat].value += value;
        this.monsterMenu[target].statChange[stat].txtValue.setText(this.convertNumberToBuffNerfText(this.monsterMenu[target].statChange[stat].value));
        
        // caso seja maior que 6
        if (this.monsterMenu[target].statChange[stat].value >= 6) {
            this.monsterMenu[target].statChange[stat].value = 6;
            this.monsterMenu[target].statChange[stat].txtValue.setText("+6");
            return;
        };
        //caso seja menor que -6
        if (this.monsterMenu[target].statChange[stat].value <= -6) {
            this.monsterMenu[target].statChange[stat].value = -6;
            this.monsterMenu[target].statChange[stat].txtValue.setText("-6");
            return;
        };
        return;
    };

    this.monsterMenu[target].statChange[stat].has = true;
    this.monsterMenu[target].statChange[stat].value = value;

    this.monsterMenu[target].statChange[stat].baseSprite = this.add.sprite(
        this.database.interface.battle.statchange.positions[target][stat].x,
        this.database.interface.battle.statchange.positions[target][stat].y,
        "buff_nerf_bar"
    ).setOrigin(0, 0);

    this.monsterMenu[target].statChange[stat].valueSprite = this.add.sprite(
        this.monsterMenu[target].statChange[stat].baseSprite.x + this.database.interface.battle.statchange.size.width,
        this.database.interface.battle.statchange.positions[target][stat].y,
        "buff_nerf_bar"
    ).setOrigin(0, 0);
    
    this.monsterMenu[target].statChange[stat].txtBase = this.add.text(
        this.database.interface.battle.statchange.positions[target][stat].x + 2,
         this.database.interface.battle.statchange.positions[target][stat].y + 1,
        this.cache.json.get("language").battle[stat][this.lang], 
        {
            fontFamily: "Century Gothic",
            fontSize: stat == "acc" ? 12 : 15,
            color: "#fff"
        }
    );
    this.monsterMenu[target].statChange[stat].txtValue = this.add.text(
        this.monsterMenu[target].statChange[stat].valueSprite.x + 2,
        this.database.interface.battle.statchange.positions[target][stat].y + 1,
        this.convertNumberToBuffNerfText(value),
        {
            fontFamily: "Century Gothic",
            fontSize: 15,
            color: "#fff"
        }
    );

    this.monsterMenu[target].statChange[stat].baseSprite.alpha = 0;
    this.monsterMenu[target].statChange[stat].valueSprite.alpha = 0;
    this.monsterMenu[target].statChange[stat].txtBase.alpha = 0;
    this.monsterMenu[target].statChange[stat].txtValue.alpha = 0;

    this.tweens.add({
        targets: [
            this.monsterMenu[target].statChange[stat].baseSprite, 
            this.monsterMenu[target].statChange[stat].valueSprite,
            this.monsterMenu[target].statChange[stat].txtBase,
            this.monsterMenu[target].statChange[stat].txtValue
        ],
        ease: "Linear",
        duration: 900,
        alpha: 1
    });

    this.containers.interface.add(this.monsterMenu[target].statChange[stat].baseSprite);
    this.containers.interface.add(this.monsterMenu[target].statChange[stat].valueSprite);
    this.containers.interface.add(this.monsterMenu[target].statChange[stat].txtBase);
    this.containers.interface.add(this.monsterMenu[target].statChange[stat].txtValue);
};

// remover buff/nerf
Battle.removeBuffNerf = function (target, stat) {
    if (stat == "all") {
        ["atk", "def", "spe", "acc","eva"].forEach(_stat => {
            if (this.monsterMenu[target].statChange[_stat].has) {
                this.monsterMenu[target].statChange[_stat].baseSprite.destroy();
                this.monsterMenu[target].statChange[_stat].valueSprite.destroy();
                this.monsterMenu[target].statChange[_stat].txtBase.destroy();
                this.monsterMenu[target].statChange[_stat].txtValue.destroy();
                this.monsterMenu[target].statChange[_stat].value = 0;
                this.monsterMenu[target].statChange[_stat].has = false;
            };
        });

        return;
    };

    if (this.monsterMenu[target].statChange[stat].has) {
        this.monsterMenu[target].statChange[stat].baseSprite.destroy();
        this.monsterMenu[target].statChange[stat].valueSprite.destroy();
        this.monsterMenu[target].statChange[stat].txtBase.destroy();
        this.monsterMenu[target].statChange[stat].txtValue.destroy();
        this.monsterMenu[target].statChange[stat].value = 0;
        this.monsterMenu[target].statChange[stat].has = false;
    };
};

Battle.addMonsterAnimations = function (id, sprite) {

    const name = this.database.monsters[id].name;
    const frames = [];

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

Battle.waitChose = function () {
    this.clearMenu();

    this.text[0] = this.add.text(this.menuBase.x + 5, this.menuBase.y + 5, this.cache.json.get("language").battle["waitchose"][this.lang], {
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff" 
    });
};

Battle.appendHourglass = function () {

    if (this.timerBtn)
        this.timerBtn.destroy();

    this.timerBtn = this.add.sprite(226, 104, "hourglass-icon")
        .setOrigin(0, 0)
        .setFrame(0);

    this.timerBtn.setInteractive({
        useHandCursor: true
    });

    this.timerBtn
        .on("pointerdown", () => this.claimTimer());

    this.hasHouglass = true;
};

Battle.appendTimer = function () {

    this.timerAdded = true;

    if (this.hasHouglass) {
        this.timerBtn.setFrame(1);
    } else {
        this.appendHourglass();
        this.timerBtn.setFrame(1);
    };

    this.initialTime = 5;

    this.timerText = this.add.text(226, 140, this.formatTime(this.initialTime), {
        fontFamily: "Century Gothic", 
        fontSize: 14, 
        color: "#fff"
    });

    this.containers.interface.add(this.timerText);

    this.timedEvent = this.time.addEvent({
        delay: 1000, 
        callback: () => {
            this.initialTime -= 1;
            
            if (this.initialTime <= 0)
                this.timedEvent.remove();

            this.timerText.setText(this.formatTime(this.initialTime));
        }, 
        callbackScope: this, 
        loop: true 
    });
};

Battle.removeTimerHouglass = function () {
    this.hasHouglass = false;
    this.timerBtn.destroy();
    this.initialTime = 5;
    
    if (this.timerAdded) {
        this.timerText.destroy();
        this.timedEvent.remove();
    };

    this.timerAdded = false;
};

Battle.formatTime = function (seconds) {

    const minutes = Math.floor(seconds / 60);

    let partInSeconds = seconds % 60;

    partInSeconds = partInSeconds.toString().padStart(2, "0");

    return `${minutes}:${partInSeconds}`;
};

Battle.appendChatMessages = function () {

    if (this.chatTextArea) {
        this.chatTextArea.visible = true;
        this.tweens.add({
            targets: this.chatTextArea,
            ease: "Linear",
            duration: 600,
            alpha: 1
        });
        this.chatTextArea.setT(1);
        this.chatTextArea.scrollToBottom();
        return;
    };

    const COLOR_PRIMARY = 3426654;
    const COLOR_LIGHT = 2899536;
    const COLOR_DARK = 0x3B536B;

    const height = 75;

    textArea = this.rexUI.add.textArea({
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

Battle.toggleChat = function () {
    this.statusShowingChat = !this.statusShowingChat;

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

        Elements.chat.querySelector("[data-type=chat]").style.display = "none";

        this.disableEnableButtons(true);

        return;
    };

    this.disableEnableButtons(false);
    this.appendChatMessages();
};

Battle.receiveChatMessage = function (data) {


    const player = data.uid == 1 ? "Ivopc" : "Roberto";

    if (!this.chatTextArea) {
        this.chatMessages += `\n[b]${player}[/b]: ${data.message}`;
        return;
    };
    
    // checar se esta no limite
    const scrollThis = this.chatTextArea.t == 1;
    // {message, uid}
    this.chatTextArea.appendText(`\n[b]${player}[/b]: ${data.message}`);

    this.chatMessages = this.chatTextArea.text;

    // deve scrollar se estiver no "limite" do scroll
    if (scrollThis)
        this.chatTextArea.scrollToBottom();

    // checar se precisa do autoscroll pq tá bugado (inicialmente slider não pode ser
    // setado para scrollar para o bottom)
    if (++this.countChatMessages == 5)
        this.chatTextArea.scrollToBottom();
};

Battle.test = function () {
    var particles = this.add.particles("flares");

    particles.createEmitter({
        frame: "red",
        x: this.monster.player.getCenter().x, y: this.monster.player.getCenter().y,
        lifespan: 1000,
        angle: { start: 0, end: 360, steps: 32 },
        speed: 100,
        quantity: 16,
        scale: { start: 0.3, end: 0 },
        frequency: 64
    });

    particles.createEmitter({
        frame: "green",
        x: this.monster.opponent.getCenter().x, y: this.monster.opponent.getCenter().y,
        lifespan: { min: 600, max: 800 },
        angle: { start: 0, end: 360, steps: 64 },
        speed: 100,
        quantity: 64,
        scale: { start: 0.2, end: 0.1 },
        frequency: 32
    });

    // particles.createEmitter({
    //     frame: "yellow",
    //     x: this.monster.player.getCenter().x, y: this.monster.player.getCenter().y,
    //     lifespan: 800,
    //     angle: { start: 360, end: 0, steps: 32 },
    //     speed: 100,
    //     quantity: 1,
    //     scale: { start: 0.8, end: 0 },
    //     frequency: 40,
    //     blendMode: "ADD"
    // });

    // particles.createEmitter({
    //     frame: "blue",
    //     x: this.monster.opponent.getCenter().x, y: this.monster.opponent.getCenter().y,
    //     lifespan: 1000,
    //     angle: { start: 0, end: 360, steps: 360 },
    //     speed: 100,
    //     quantity: 8,
    //     scale: { start: 0.4, end: 0 },
    //     blendMode: "ADD"
    // });

    this.weather.rain.bind(this)();

    this.containers.preAction.add(particles);
};

// Carregar sprite do monstro em assincronia
Battle.loadMonsterSprite = function (id, callback) {
    this.load.once("complete", callback, this);

    this.load.atlas("monster_" + (id), "/assets/img/monsters/" + (id) + ".png", "/assets/res/monster_" + (id) + ".json");

    this.load.start();
};

// Pegar primeiro monstro que não esteja desmaiado
Battle.getFirstPlayerMonsterAlive = function (monsters) {

    for (let i = 0; i < 6; i++)
        if (monsters["monster" + i] && monsters["monster" + i].current_HP > 0)
            return monsters["monster" + i];
    
    return null;
};

// Pegar index do primeiro monstro que não esteja desmaiado
Battle.getFirstPlayerMonsterAliveIndex = function (monsters) {
    for (let i = 0; i < 6; i++)
        if (monsters["monster" + i] && monsters["monster" + i].current_HP > 0)
            return i;
    
    return null;
};

// Pegar index do monstro na party pelo ID do monstro especificado 
Battle.getMonsterDataById = function (id, monsters) {
    for (let i = 0; i < 6; i ++)
        if (monsters["monster" + i] && monsters["monster" + i].id == id)
            return monsters["monster" + i];

    return null;
};

// Pegar index do monstro na party pelo ID do monstro especificado 
Battle.getIndexById = function (id, monsters) {
    for (let i = 0; i < 6; i ++)
        if (monsters["monster" + i] && monsters["monster" + i].id == id)
            return i;

    return null;
};

export default Battle;