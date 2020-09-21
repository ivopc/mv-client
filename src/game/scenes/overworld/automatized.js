import Overworld from "./index";
import async from "async";
import _ from "underscore";

// interagir com objeto
Overworld.interactWithObject = function () {

    // ve se interação está bloqueada
    if (this.isInteractionLocked)
        return;

    // bloqueia interação
    this.switchInteractionLock();

    // posição atual do jogador
    const position = _.clone({
        x: this.player._data.position.x,
        y: this.player._data.position.y
    });
        // objeto que irá interagir
    let object;

    // verificando posição do jogador
    switch(this.player._data.position.facing) {
        case 0: { // cima
            object = this.mapObjectPosition[position.x + "|" + (--position.y)];
            break;
        };
        case 1: { // direita
            object = this.mapObjectPosition[(++position.x) + "|" + position.y];
            break;
        };
        case 2: { // baixo
            object = this.mapObjectPosition[position.x + "|" + (++position.y)];
            break;
        };
        case 3: { // esquerda
            object = this.mapObjectPosition[(--position.x) + "|" + position.y];
            break;
        };
    };

    // desbloqueia interação em 500 m/s
    this.time.addEvent({delay: 500, callback: () => this.switchInteractionLock()});

    // se objeto não existir, acontece nada
    if (!object)
        return;

    // salvar objeto que interagiu
    this.currentObjectInteracted = object;

    // chamar ação do objeto
    this.callObjectAction(object);
};

// chamar ação do objeto
Overworld.callObjectAction = function (name, callback) {

    const events = this.cache.json.get(this.getCurrentMapName("events"));

    this.automatizeAction({
        type: events.elements.config[name].type,
        name
    }, events.elements.screenplay[name][this.flag] || events.elements.screenplay[name]["default"], () => {
        if (callback && typeof(callback) == "function")
            callback();
    });
};

// automatizar e executar ações do objeto
Overworld.automatizeAction = function (object, actions, callback) {

    /* declarando lista de funções que serão executadas
     em sincronia e uma após a outra
     executando loop nas ações para registra-las na lista 'fn' */
    const fn = [];

    for (let i = 0, l = actions.length; i < l; i++) {

        // declarando parametro que sempre irá mudar
        let param,
            fnName = actions[i][0];

        // vendo qual ação é e definindo paramêtro especifico
        // pra cada uma
        switch(fnName) {

            // chamar função do próprio objeto
            case "callObjectFunction": {
                param = {
                    fn: actions[i][1] || []
                };
                break;
            };

            // chamar função que é independente dos objetos
            case "callFunction": {
                param = {
                    fn: actions[i][1] || []
                };
                break;
            };

            // delay
            case "delay": {
                param = {
                    delay: actions[i][1] || 200
                };
                break;
            };

            // escolha randômica
            case "random": {
                param = {
                    fns: actions[i][1]
                };
                break;
            };

            // andar
            case "walk": {
                param = {
                    direction: actions[i][1]
                };

                if (actions[i][2]) {
                    param.delay = actions[i][2].delay || 50;
                    param.target = actions[i][2].target || null;
                } else {
                    param.delay = 50;
                    param.target = null;
                };
                break;
            };

            // virar pra lado tal
            case "face": {
                param = {
                    direction: actions[i][1]
                };

                if (actions[i][2]) {
                    param.target = actions[i][2].target;
                } else {
                    param.target = null;
                };

                break;
            };

            // dialogo
            case "dialog": {
                param = {
                    text: actions[i][1]
                };

                if (actions[i][2]) {
                    param.dontUnstopOnEndDialog = actions[i][2].dontUnstopOnEndDialog;
                };
                break;
            };

            // mostrar sprite
            case "show": {
                param = {
                    name: actions[i][1]
                };
                break;
            };

            // esconder sprite
            case "hide": {
                param = {
                    name: actions[i][1]
                };
                break;
            };

            case "stopPlayer": {
                param = {
                    flag: actions[i][1]
                };
                break;
            };

            // mostrar aceitar quest ou não
            case "showAcceptQuestInterface": {
                param = {
                    quest_id: actions[i][1]
                };

                break;
            };

            case "closeAcceptQuestInterface": {
                break;
            };

            // requisitar flag
            case "requestFlag": {
                param = {
                    flag: actions[i][1]
                };

                break;
            };

            // setar flag do mapa
            case "setMapFlag": {
                param = {
                    value: actions[i][1]
                };
                break;
            };

            case "requestQuest": {
                param = {
                    id: actions[i][1]
                };

                break;
            }

            // pegar inputs do usuário
            case "get_input": {
                param = {
                    text: actions[i][1].text,
                    variable: actions[i][1].variable,
                    style: actions[i][1].style
                };
                break;
            };

            case "disableMoveInputs": {
                break;
            };

            case "enableMoveInputs": {
                break;
            };

            case "ifNotBattled": {
                param = {
                    fn: actions[i][1] || []
                };
                break;
            }
        };

        // se a função não existir
        if ( !(fnName in this.automatedAction) )
            fnName = "empty"; 

        // adicionar função com nome dinâmico aplicando os parametros e objeto
        // ao escopo dele
        fn.push(this.automatedAction[fnName].bind({
            self: this,
            param,
            object
        }));
    };

    // executa lista e quando todas forem executadas chama callback
    async.series(fn, callback);
};

// controle de funções automatizadas
Overworld.automatedAction = {
    empty: next => next(),
    call: function (next) {
        const 
            param = this.param,
            object = this.object,
            events = this.self.cache.json.get(this.self.getCurrentMapName("events"));

        this.self.automatizeAction({
            type: events.elements.config[object.name].type,
            name: object.name
        }, events.elements.screenplay[object.name][param.fn], () => {
            if (next && typeof(next) == "function")
                next();
        });
    },
    callFunction: function (next) {
        const 
            param = this.param,
            events = this.self.cache.json.get(this.self.getCurrentMapName("events"));


        this.self.automatizeAction({}, events.functions[param.fn], next);
    },
    delay: function (next) {
        this.self.time.addEvent({
            delay: this.param.delay, 
            callback: next
        });
    },
    random: function (next) {
        // chamar index randômica da array de funções
        this.self.automatizeAction({
            type: 2
        }, [this.param.fns[Math.floor(Math.random() * this.param.fns.length)]], next);
    },
    walk: function (next) {
        // parametro da função, self e objeto
        const 
            param = this.param,
            object = this.object,
            self = this.self;
            
        let direction,
            type;

        object.name = object.name || param.target;

        switch (object.type) {
            case 2: 
            case 4:
            {
                type = _.clone(object.type);
                break;
            };
            
            default: {
                type = 2;
                break;
            };
        };

        if (param.target == "${player}")
            type = 0;

        switch (param.direction) {
            case "up": {
                direction = 0;
                break;
            };

            case "right": {
                direction = 1;
                break;
            };

            case "down": {
                direction = 2;
                break;
            };

            case "left": {
                direction = 3;
                break;
            };
        };

        switch (type) {

            case 0: {
                self.player.walk(direction, () => {
                    // executa após tempo determinado
                    self.time.addEvent({delay: param.delay, callback: next});
                });
                break;
            };

            case 2: 
            case 4:
            {
                self.object_data[object.name].walk(direction, () => {
                    // executa após tempo determinado
                    self.time.addEvent({delay: param.delay, callback: next});
                });
                break;
            };
        };
    },
    face: function (next) {
        const 
            param = this.param,
            object = this.object,
            self = this.self;

        let type;

        switch (object.type) {
            case 2: 
            case 4:
            {
                type = _.clone(object.type);
                break;
            };

            default: {
                type = 2;
                break;
            };
        };

        if (param.target == "${player}")
            type = 0;
            
        let direction;

        switch (this.param.direction) {
            case "up": {
                direction = 0;
                break;
            };

            case "right": {
                direction = 1;
                break;
            };

            case "down": {
                direction = 2;
                break;
            };

            case "left": {
                direction = 3;
                break;
            };

            default: {
                direction = "toplayer";
                break;
            };
        };


        switch (type) {

            case 0: {
                self.player.face(direction);
                break;
            };

            case 2: 
            case 4:
            {
                self.object_data[object.name || param.target].face(direction);
                break;
            };
        };

        next();
    },
    dialog: function (next) {
        // chama função de dialogo
        this.self.addDialog(this.param.text, next, this.param.dontUnstopOnEndDialog);
    },
    show: function (next) {
        const param = this.param;
        this.self.object_data[param.name].visible = true;
        next();
    },
    hide: function (next) {
        const param = this.param;
        this.self.tweens.add({
            targets: this.self.object_data[param.name],
            ease: "Linear",
            duration: 600,
            alpha: 0,
            onComplete: () => {
                const object = this.self.object_data[param.name];
                console.log(this.self.mapObjectPosition);
                delete this.self.mapObjectPosition[object._data.position.x + "|" + object._data.position.y];
                console.log(this.self.mapObjectPosition);
                this.self.object_data[param.name].destroy();
                delete this.self.object_data[param.name];
                next();
            } 
        });
    },
    stopPlayer: function (next) {
        this.self.player._data.stop = this.param.flag;
        next();
    },
    showAcceptQuestInterface: function (next) {
        this.self.appendAcceptRejectQuest(this.param.quest_id);
        next();
    },
    closeAcceptQuestInterface: function (next) {
        this.self.clearAcceptRejectQuest();
        next();
    },
    requestFlag: function (next) {

        const param = this.param;

        console.log("var dinamicas", this.self.dynamicVariables);

        // se tiver input do usuário
        if (param.flag.data) {
            for (let i = 0, inputs = Object.keys(param.flag.data), l = inputs.length; i < l; i ++) {
            
                let input = inputs[i],
                    newinput = "${" + input + "}";

                if (newinput in this.self.dynamicVariables)
                    param.flag.data[input] = this.self.dynamicVariables[newinput];
           };
        };

        this.self.requestFlag(param.flag);
        next();
    },
    setMapFlag: function (next) {
        this.self.flag = this.param.value;
        next();
    },
    requestQuest: function (next) {
        this.self.requestQuest(this.param);
        next();
    },
    get_input: function (next) {
        const param = this.param;

        switch (param.style) {
            case "choose_initial_monster": {
                this.self.appendInitialMonsterMenu(param.variable, next);
                break;
            };
        };
        //this.self.dynamicVariables[param.variable] = prompt(param.text);
        //next();
    },
    disableMoveInputs: function (next) {
        this.self.disableMoveInputs = true;
        next();
    },
    enableMoveInputs: function (next) {
        this.self.disableMoveInputs = false;
        next();
    },
    appendMarket: function (next) {
        this.self.appendMarket();
        next();
    },
    appendMonsterBox: function (next) {
        this.self.requestMonsterBox();
        next();
    },
    appendLoaderSprite: function (next) {},
    destroyLoaderSprite: function (next) {},
    ifNotBattled: function (next) {

        const 
            param = this.param,
            object = this.object,
            events = this.self.cache.json.get(this.self.getCurrentMapName("events"));

        if (!this.self.tamers[events.elements.config[object.name].tamer_id].value) {
            
            console.log("1 - FOI");

            console.log(param.fn);

            console.log(events.elements.screenplay[object.name][param.fn]);

            this.self.automatizeAction({
                type: events.elements.config[object.name].type,
                name: object.name
            }, param.fn, () => {
                if (next && typeof(next) == "function")
                    next();
            });
        } else {
            console.log("2 - NÃO FOI");
            next();
        };
    }
};

 // variaveis dinâmicas
Overworld.dynamicVariables = {};

// Percorrer todos os domadores do mapa 
Overworld.checkPlayerPositionTamer = function (events) {
    if (events.map.hasTamers) {
        _.each(events.elements.config, element => {

            if (element.isTamer && this.tamers && this.tamers[element.tamer_id] && !this.tamers[element.tamer_id].value) {

                const DIRECTIONS = this.database.overworld.directions_hash;

                switch (this.object_data[element.name]._data.position.facing) {
                    // up
                    case DIRECTIONS.UP: {
                        this.checkPlayerTamerRange(
                            "y", 
                            "x",
                            DIRECTIONS.UP,
                            DIRECTIONS.DOWN, 
                            element, 
                            events
                        );
                        break;
                    };
                    // right
                    case DIRECTIONS.RIGHT: {
                        this.checkPlayerTamerRange(
                            "x", 
                            "y",
                            DIRECTIONS.RIGHT,
                            DIRECTIONS.LEFT, 
                            element, 
                            events
                        );
                        break;
                    };
                    // down
                    case DIRECTIONS.DOWN: {
                        this.checkPlayerTamerRange(
                            "y", 
                            "x",
                            DIRECTIONS.DOWN,
                            DIRECTIONS.UP, 
                            element, 
                            events
                        );
                        break;
                    };
                    // left
                    case DIRECTIONS.LEFT: {
                        this.checkPlayerTamerRange(
                            "x", 
                            "y",
                            DIRECTIONS.LEFT,
                            DIRECTIONS.RIGHT, 
                            element, 
                            events
                        );
                        break;
                    };
                };
            };
        });
    };
};

// Ver distancia dos domadores
Overworld.checkPlayerTamerRange = function (axis, equalAxis, viewDirection, walkDirection, element, events) {

    const DIRECTIONS = this.database.overworld.directions_hash;
    let canWalk;

    // verificando se o player está ao alcance do domador com sua variantes
    switch (viewDirection) {
        case DIRECTIONS.RIGHT:
        case DIRECTIONS.DOWN:
        {
            canWalk = this.player._data.position[axis] > this.object_data[element.name]._data.position[axis] && this.player._data.position[axis] <= this.object_data[element.name]._data.position[axis] + element.maxview && this.player._data.position[equalAxis] == this.object_data[element.name]._data.position[equalAxis];
            break;
        };

        case DIRECTIONS.UP:
        case DIRECTIONS.LEFT:
        {
            canWalk = this.player._data.position[axis] < this.object_data[element.name]._data.position[axis] && this.player._data.position[axis] >= this.object_data[element.name]._data.position[axis] - element.maxview && this.player._data.position[equalAxis] == this.object_data[element.name]._data.position[equalAxis];
            break;
        };
    };

    // se estiver, chama batalha
    if (canWalk) {
        let pos = (this.player._data.position[axis] - this.object_data[element.name]._data.position[axis]) - 1,
            script = [];

        // corrigindo se for UP ou LEFT
        if (pos < 0) {
            pos *= -1;
            pos -= 2;
        };
        
        for (let i = 0; i < pos; i++) {
            script.push([
                "walk", 
                this.database.overworld.directions[this.object_data[element.name]._data.position.facing]
            ]);
        };

        this.player._data.stop = true;

        if (!script.length) {
            this.player.face(walkDirection);
            this.automatizeAction(
                {
                    type: events.elements.config[element.name].type,
                    name: element.name
                }, 
                events.elements.screenplay[element.name]["battle"],
                () => {
                    this.player._data.stop = false;
                }
            );

            return;
        };

        async.series([
            next => {
                this.automatizeAction({
                    type: events.elements.config[element.name].type,
                    name: element.name
                }, script, next);
            },
            next => {
                this.player.face(walkDirection);

                this.automatizeAction(
                    {
                        type: events.elements.config[element.name].type,
                        name: element.name
                    }, 
                    events.elements.screenplay[element.name]["battle"],
                    next
                );
            },
            () => {
                this.player._data.stop = false;
            }
        ]);
    };
};

// mudar interação (dis)lockada
Overworld.switchInteractionLock = function () {
    this.isInteractionLocked = !this.isInteractionLocked;
};

// auto executar ao entrar no mapa
Overworld.autoExec = function () {
    const events = this.cache.json.get(this.getCurrentMapName("events"));

    if (!events.autoExec)
        return;

    if (this.flag in events.autoExec)
        this.automatizeAction({}, events.autoExec[this.flag]);

};

// executar injeção de ações
Overworld.execInjectedAction = function (data) {
    switch (data.action) {
        case "heal_dialog": {
            this.addDialog(this.database.injectedactions.heal_dialog);
            break;
        };
    };
};

export default Overworld;