import RawCharacter from "./rawcharacter";
import BalloonDialog from "./balloondialog";

class Character extends RawCharacter {

    constructor (scene, data) {

        super(
            scene, 
            scene.positionToRealWorld(data.position.x), 
            scene.positionToRealWorld(data.position.y),
            data
        );

        this.elements = {
            nickname: null,
            clan: null,
            balloon: {
                typing: null,
                dialog: null,
                emotion: null,
                quest: null
            },
            grassOverlay: null
        };

        // eventos
        this.events = {
            startMove: [],
            endMove: [],
            cantMove: []
        };
        
        // overlay do matinho
        this.grassOverlay;

        data = data || {};
        // normaliza dados
        data.position = data.position || {};
        data.position.x = data.position.x || 0;
        data.position.y = data.position.y || 0;
        data.position.facing = data.position.facing || 0;
        data.follower = data.follower || {};
        data.follower.has = data.follower.has || false;
        data.follower.id = data.follower.id || null;

        if ("visible" in data)
            this.visible = data.visible;

        // aplica dados
        this._data = {
            type: data.type,
            name: data.name,
            sprite: data.sprite,
            atlas: scene.database.characters[data.sprite].atlas,
            position: {
                x: data.position.x,
                y: data.position.y,
                facing: data.position.facing
            },
            stepFlag: 0,
            follower: {
                has: data.follower.has,
                id: data.follower.name
            },
            moveInProgress: false
        };

        if (data.isTamer) {
            this._data.isTamer = true;
            this._data.maxview = data.maxview;
        };

        if (data.type == 1) {
            this._data.nickname = data.nickname;
        };

        this.changeOrigin(data.position.facing);
    }

    changeSprite (sprite) {
        if (this.scene.textures.exists(this.scene.database.characters[sprite].atlas)) {
            this._data.sprite = sprite;
            this.rawSetSprite(sprite);
        } else {
            this.loadAtlasAsync(sprite);
        };
    }

    onStartMove(callback) {
        this.events.startMove.push(callback);
    }

    onEndMove(callback) {
        this.events.endMove.push(callback);
    }

    onCantMove(callback) {
        this.events.cantMove.push(callback);
    }

    triggerStartMove (position) {
        //this.events.startMove.forEach(callback => callback(pos));
        for (let i = 0, l = this.events.startMove.length; i < l; i++)
            this.events.startMove[i](position);
    }

    triggerEndMove (position) {
        for (let i = 0, l = this.events.endMove.length; i < l; i++)
            this.events.endMove[i](position);
    }

    triggerCantMove (position) {
        for (let i = 0, l = this.events.cantMove.length; i < l; i++)
            this.events.cantMove[i](position);
    }

    addInteraction (fn) {
        this.setInteractive().on("pointerdown", fn);
    }

    createFollower (sprite) {

        const
            position = { ... this._data.position },
            DIRECTIONS = this.scene.database.overworld.directions_hash;

        switch (this._data.position.facing) {
            case DIRECTIONS.UP: {
                position.y ++;
                break;
            };
            case DIRECTIONS.RIGHT: {
                position.x --;
                break;
            };
            case DIRECTIONS.DOWN: {
                position.y --;
                break;
            };
            case DIRECTIONS.LEFT: {
                position.x ++;
                break;
            };
        };

        const follower = this.scene.appendCharacter({
            name: "follower_" + Date.now() + "_" + (Math.floor(Math.random() * 1000)),
            char: sprite,
            pos: {
                x: position.x,
                y: position.y
            },
            dir: this._data.position.facing,
            type: 3
        });

        this.setFollower(follower._data.name);

        this.scene.depthSort();
    }

    setFollower (id) {
        this._data.follower = {
            has: true,
            id
        };
    }

    removeFollower () {

        if (!this._data.follower.has)
            return;

        this.scene.follower_data[this._data.follower.id].destroy();
        delete this.scene.follower_data[this._data.follower.id];

        this._data.follower = {
            has: false,
            id: null
        };
    }

    addGrassOverlay (sprite) {
        this.grassOverlay = sprite;
    }

    removeGrassOverlay () {
        if (this.grassOverlay) {
            this.grassOverlay.destroy();
            this.grassOverlay = null;
        };
    }

    addTypingBalloon () {
        this.elements.balloon.typing = new BalloonDialog(this.scene)
            .setOrigin(0.5)
            .setX(this.getCenter().x)
            .setY(this.y - this.displayHeight + 10);
    }

    removeTypingBalloon () {
        if (this.elements.balloon.typing) {
            this.elements.balloon.typing.destroy();
            this.elements.balloon.typing = null;
        };
    }

    displayName (name) {
        this.elements.nickname = this.scene.add.text(0, 0, name, { 
            fontFamily: "Century Gothic", 
            fontSize: 12,
            color: "#fff" 
        })
            .setOrigin(0.5)
            .setX(this.getCenter().x)
            .setY(this.y + this.displayHeight);

        this.scene.containers.main.add(this.elements.nickname);
    }

    get elementsToFollow () {
        const els = [];
        if (this.elements.nickname)
            els.push(this.elements.nickname);

        if (this.elements.balloon.typing)
            els.push(this.elements.balloon.typing);

        return els;
    }

    elementsFollow () {
        if (this.elements.nickname) {
            this.elements.nickname
                .setOrigin(0.5)
                .setX(this.getCenter().x)
                .setY(this.y + this.displayHeight);
        };

        if (this.elements.balloon.typing) {
            this.elements.balloon.typing
                .setOrigin(0.5)
                .setX(this.getCenter().x)
                .setY(this.y - this.displayHeight + 10);
        };
    }

    removeSprite () {
        if (this.elements.nickname)
            this.elements.nickname.destroy();

        this.removeTypingBalloon();

        this.destroy();
    }

    // executar colisão
    collide (direction) {
        // posição do char
        const position = { ... this._data.position };

        // incrementa nova posição
        switch(direction) {
            // cima
            case 0: {
                position.y --;
                break;
            };
            // direita
            case 1: {
                position.x ++;
                break;
            };
            // down
            case 2: {
                position.y ++;
                break;
            };
            // esquerda
            case 3: {
                position.x --;
                break;
            };
        };

        // pega informação dos tiles para executar colisão
        const 
            tileY = this.scene.collisionLayer.data[position.y] ? this.scene.collisionLayer.data[position.y] : 0,
            tileX = tileY[position.x] ? tileY[position.x] : 0,
            tilesXY = tileY ? this.scene.database.overworld.tile.properties[tileX.index] : 0;

        // se não for o jogador
        if (!this._data.isPlayer) {

            if (this._data.type == 1) { // outro jogador online
                
                // muda posição
                this._data.position.x = position.x;
                this._data.position.y = position.y;
                
                // se for matinho
                if (tilesXY.wild)
                    return 4;

                // ok
                return 1;
            };

            // checa se colide com posição atual do jogador
            const collision = position.x == this.scene.player._data.x && position.y == this.scene.player._data.y;
            
            // se não colidir, muda posição
            if (!collision && this._data.type != 3) {

                // apaga posição atual no mapa
                delete this.scene.mapObjectPosition[this._data.position.x + "|" + this._data.position.y];
                
                // cria nova posição
                this.scene.mapObjectPosition[position.x + "|" + position.y] = this._data.name;

                // edita posição do objeto
                this._data.position.x = position.x;
                this._data.position.y = position.y;
            };
            // criar overlay do matinho
            if (tilesXY.wild)
                return 4;

            // informa se colidiu ou não
            return collision ? 0 : 1;
        };

        // se for tile limite, bloqueio, ou existir algum objeto no lugar
        if (!tileY || !tileX || !tilesXY || tilesXY.block || this.scene.mapObjectPosition[position.x + "|" + position.y])
            return 0; // 0

        // muda posição do jogador
        this._data.position.x = position.x;
        this._data.position.y = position.y;

        // ** daqui pra baixo pode executar em assincronia
        // solicita mudar de mapa
        if (tilesXY.door)
            return 3;

        // solicita luta selvagem
        if (tilesXY.wild)
            return 4;

        // chega tile de evento
        if (tilesXY.event)
            return 7;

        // ok, pode andar
        return 1;
    }

    // andar no mapa
    walk (direction, callback) {
        // se for o jogador
        if (this._data.isPlayer) {
            // se walk estiver em progresso -> sai
            // se jogador estiver parado -> sai
            if (this._data.moveInProgress || this._data.stop)
                return;
        };
        // posição antiga
        const older = { ... this._data.position };
        // callback interna
        let internal_callback;
        // executar colisão
        const collision = this.collide(direction);
        // vendo quem é
        switch (this._data.type) {
            // se é player
            case 0: {
                switch (collision) {

                    // não pode se mover
                    case 0: {
                        //** publicando no canal do mapa que mudou facing para tal direção
                        if (this.scene.subscribe.map.is && this._data.position.facing != direction)
                            this.scene.subscribe.map.conn.publish({
                                dir: direction,
                                dataType: 2
                            });
                        // mudando facing na memória
                        this._data.position.facing = direction;
                        // executando animação idle para o lado
                        this.anims.play(this.scene.database.characters[this._data.sprite].name + "_idle_" + this.scene.database.overworld.directions[direction]);
                        // disparando evento de cant move
                        this.triggerCantMove({
                            facing: direction,
                            x: this._data.position.x,
                            y: this._data.position.y
                        });
                        // saindo pois não ira se mexer
                        return;
                    };

                    // solicitar mudança de mapa
                    case 3: {
                        // pegando eventos, buscando map id e teleport id
                        let teleport = this.scene.cache.json.get(this.scene.getCurrentMapName("events")).map.teleport.find(position => position.x === this._data.position.x && position.y === this._data.position.y);
                        console.log({ teleport });
                        // adicionar callback e enviar request para o servidor
                        internal_callback = () => this.scene.requestMapChange(teleport.mid, teleport.tid);
                        break;
                    };

                    // solicitar batalha selvagem | criar overlay do matinho
                    case 4: {
                        let pos = {
                            x: this._data.position.x,
                            y: this._data.position.y
                        };
                        // remove grass antigo
                        this.removeGrassOverlay();

                        // appenda particulas de grama
                        internal_callback = () => {
                            // adiciona overlay
                            this.addGrassOverlay(this.scene.appendGrassOverlay(pos.x, pos.y));
                            // add particles
                            this.scene.appendGrassParticles(pos.x, pos.y);
                            // requisitar batalha selvagem
                            this.scene.requestWildBattle();
                        };


                        break;
                    };

                    // checar se tem algum evento
                    case 7: {
                        // pegando eventos, buscando map id e teleport id
                        const 
                            mapData = this.scene.cache.json.get(this.scene.getCurrentMapName("events")),
                            event = mapData.events.config.find(position => position.x === this._data.position.x && position.y === this._data.position.y);

                        internal_callback = () => {
                            if (mapData.events.script[event.id].requiredFlagValueToExec.indexOf(this.scene.flag) >= 0) {
                                this.scene.automatizeAction({
                                    type: 2
                                }, mapData.events.script[event.id].script);
                            };
                        };
                        break;
                    };
                };

                //** pode andar
                // se tiver overlay de grass
                this.removeGrassOverlay();

                // setando walk em progresso
                this._data.moveInProgress = true;
                // mudando facing
                this._data.position.facing = direction;
                // parando animação do idle para iniciar animação 'procedural'
                this.anims.stop();
                //** publicando no canal do mapa que andou para tal direção
                if (this.scene.subscribe.map.is)
                    this.scene.subscribe.map.conn.publish({
                        dir: direction,
                        dataType: 1 
                    });

                // fazer seguidor seguir personagem (se tiver)
                if (this._data.follower.has)
                    this.scene.follower_data[this._data.follower.id].walk(older.facing);
                break;
            };

            // se for um jogador online ou um npc, ou um follower, ou npc domador
            case 1:
            case 2:
            case 3:
            case 4:
            {
                // verificando tipo da colisão e execuntando o que deve ser feito
                switch(collision) {
                    case 0: {
                        // mudando facing
                        this._data.position.facing = direction;
                        // executando animação idle para o lado
                        this.anims.play(this.scene.database.characters[this._data.sprite].name + "_idle_" + this.scene.database.overworld.directions[direction]);
                        // saindo
                        return;
                    };
                    //matinho
                    case 4: {

                        let pos = {
                            x: this._data.position.x,
                            y: this._data.position.y
                        };
                        // remove grass antigo
                        this.removeGrassOverlay();

                        // appenda particulas de grama
                        internal_callback = () => {
                            // adiciona overlay
                            this.addGrassOverlay(this.scene.appendGrassOverlay(pos.x, pos.y));
                            // add particles
                            this.scene.appendGrassParticles(pos.x, pos.y);
                        };
                        break;
                    };
                };

                //** pode andar
                this._data.moveInProgress = true;
                // se tiver overlay de grass
                this.removeGrassOverlay();

                // mudando facing
                this._data.position.facing = direction;
                // parando animação do idle para iniciar animação 'procedural'
                this.anims.stop();

                // fazer seguidor seguir personagem (se tiver)
                if (this._data.follower.has)
                    this.scene.follower_data[this._data.follower.id].walk(older.facing);

                if (this._data.type == 2 || this._data.type == 4) {

                    const element = this.scene.cache.json.get(this.scene.getCurrentMapName("events")).elements.config[this._data.name];

                    // se mandar salvar a posição dinamica
                    if (element.saveDynamicPosition) {
                        const el = element[this.scene.flag] || element["default"];
                        // preservar a posição do npc
                        el.position = {
                            x: this._data.position.x,
                            y: this._data.position.y,
                            facing: this._data.position.facing
                        };
                    };
                };
                break;
            };
        };

        // executa animação de andar
        this.animationWalk(direction, internal_callback, callback);
    }

    // mudar facing
    face (direction) {
        // se a direção for se virar ao jogador
        if (direction == "toplayer") {
            // pega qual lado jogar está posicionado
            switch(this.scene.player._data.position.facing) {
                case 0: { // cima
                    direction = 2;
                    break;
                };
                case 2: {  // baixo
                    direction = 0;
                    break;
                };
                case 3: { // esquerda
                    direction = 1;
                    break;
                };
                case 1: { // direita
                    direction = 3;
                    break;
                };
            };
        };

        // mudando facing na memória
        this._data.position.facing = direction;
        // para animação (hack para caso esteja no mesmo lado)
        this.anims.stop();
        // executando animação idle para o lado escolhido
        this.anims.play(this.scene.database.characters[this._data.sprite].name + "_idle_" + this.scene.database.overworld.directions[direction]);
        // se for player publica no mapa q vai virar pra tal direção
        if (this._data.isPlayer && this.scene.subscribe.map.is)
            this.scene.subscribe.map.conn.publish({
                dir: direction,
                dataType: 2
            });
    }

    // andar no mapa (animação/renderização) assincrono
    async animationWalk (direction, internal_callback, callback) {

        // mover personagem e elementos dele para certa direção
        switch(direction) {
            case 0: { // up
                this.scene.tweens.add({
                    targets: [this, ... this.elementsToFollow],
                    ease: "Linear",
                    duration: this.scene.database.overworld.time.step * 4,
                    y: "-=" + this.scene.database.overworld.tile.size,
                });
                break;
            };

            case 1: { // left
                this.scene.tweens.add({
                    targets: [this, ... this.elementsToFollow],
                    ease: "Linear",
                    duration: this.scene.database.overworld.time.step * 4,
                    x: "+=" + this.scene.database.overworld.tile.size,
                });
                break;
            };

            case 2: { // down
                this.scene.tweens.add({
                    targets: [this, ... this.elementsToFollow],
                    ease: "Linear",
                    duration: this.scene.database.overworld.time.step * 4,
                    y: "+=" + this.scene.database.overworld.tile.size,
                });
                break;
            };

            case 3: { // right
                this.scene.tweens.add({
                    targets: [this, ... this.elementsToFollow],
                    ease: "Linear",
                    duration: this.scene.database.overworld.time.step * 4,
                    x: "-=" + this.scene.database.overworld.tile.size,
                });
                break;
            };
        };

        // fazer animação
        await this.walkStep0(direction);
        await this.walkStep1(direction);
        this.walkEndStep(direction, internal_callback, callback);
    }

    // função complementar ao animationWalk (primeira)
    walkStep0 (direction) {
        // disparar evento de start move
        this.triggerStartMove({
            facing: direction,
            x: this._data.position.x,
            y: this._data.position.y
        });
        // mudar origem em relação ao próprio eixo
        this.changeOrigin(direction);
        // tocar flag de step
        this.switchSpriteStep(direction, this._data.stepFlag, "walk");

        // delay
        return new Promise(callback => 
            this.scene.time.addEvent({
                delay: this.scene.database.overworld.time.step * 2,
                callback
            })
        );

    }

    // função complementar ao animationWalk (segunda)
    walkStep1 (direction) {
        // tocar flag de step
        this.switchSpriteStep(direction, 0, "idle");
        // delay
        return new Promise(callback => 
            this.scene.time.addEvent({
                delay: this.scene.database.overworld.time.step * 2,
                callback
            })
        );
    }

    // quando o walk termina
    walkEndStep (direction, internal_callback, callback) {

        this._data.moveInProgress = false;

        // se for o jogador checar posição dos domadores
        if (this._data.isPlayer) 
            this.scene.checkPlayerPositionTamer(this.scene.cache.json.get(this.scene.getCurrentMapName("events")));

        // começa animação idle
        this.anims.play(this.scene.database.characters[this._data.sprite].name + "_idle_" + this.scene.database.overworld.directions[direction]);

        // atualizando profundidade dos objetos do grupo main
        this.scene.depthSort();

        // chama callback interno
        if (typeof(callback) == "function")
            callback();

        // chama callback externo
        if (typeof(internal_callback) == "function")
            internal_callback();

        // triggar end move
        this.triggerEndMove({
            facing: direction,
            x: this._data.position.x,
            y: this._data.position.y
        });
    }

    // trocar sprite do passo
    switchSpriteStep (direction, flag, type) {

        // vendo se sprite é de step e mudando step flag
        if (typeof(flag) == "number" && type == "walk") {
            flag = flag ? 0 : 1;
            this._data.stepFlag = flag;
        };

        // mudando frame
        this.setFrame(this.scene.database.characters[this._data.sprite].name + "_" + this.scene.database.overworld.directions[direction] + "_" + type + flag);
    }

    preUpdate (time, delta) {
        super.preUpdate(time, delta);
        // corrigir posição do player online
        if (this._data.type == 1 && !this._data.moveInProgress) {
            const
                x = this.scene.positionToRealWorld(this._data.position.x),
                y = this.scene.positionToRealWorld(this._data.position.y);
            if (x != this.x || y != this.y) {
                this.setPosition(x, y);
                this.elementsFollow();
            };
        };
    }
};

export default Character;