<template>
    <div>
        <section :id="containerId">
            <div id="chat">
                <input data-type="chat" type="text" maxlength="45">
            </div>
        </section>
    </div>
</template>

<script>
    import socketCluster from "socketcluster-client";
    export default {
        name: "GameClient",
        data: () => ({
            gameStarted: false,
            containerId: "game",
            gameInstance: null,
            socket: null,
            clientTokens: [
                {
                    uid: "1",
                    token: "snfQd1h05KxOjdAhuOVy8VFmmpIhWBpUrEATQLwWWk8p2Uzlnq8MLl2ZxIQDCzc9nVaPRt20RK0YSqwZtk9BnOKTwpDZ5wqdVsfd45djfZSV9i9OnqwCesIqaFhc3y6HuR8RAEVb511bp7zgiDAwfZ"
                },
                {
                    uid: "2",
                    token: "eYGrxqByiJ61Y7trwdaSrlUoF4aFDA945FmWFPTWH0ARDk8b8AmAFm9jpiUt7FmQdsY52vLnTnrkC5zsTbJXJG0JMNBJLI0PmT8c4htyzQCwtvJBMtBPWErVnGkpFQ1QYOAqrGmhITZd3IVpKV6Pqv"
                }
            ],
            currentClient: localStorage.getItem("index") || 0
        }),
        created () {
            this.eventBus.$on("call-client", this.callClient);
            this.eventBus.$on("hide-client", this.hideClient);
            this.eventBus.$on("navigate-to-other-pages", this.navigateToOtherPages);
            console.log("LOOOOOOOOOOOOOOOOOOOOL COME WITH ME.");
        },
        methods: {
            callClient () {
                if (this.gameStarted) {
                    this.eventBus.$emit("hide-elements");
                    this.$el.style.display = "block";
                } else {
                    this.appendGameClient();
                };
            },
            hideClient () {
                this.$el.style.display = "none";
            },
            navigateToOtherPages (data) {
                // limpa evento para não duplicar chamada
                this.eventBus.$off("call-client");
                this.hideClient();
                this.eventBus.$emit("show-elements");
                this.$router.push({name: data.name});
                // seta evento novamente depois que executou tudo
                this.$nextTick(() => {
                    this.eventBus.$on("call-client", this.callClient);
                });
            },
            async appendGameClient () {
                this.eventBus.$emit("hide-elements");
                const game = await import("@/game-old/game");
                this.gameInstance = game.launch(this.containerId);
                this.gameStarted = true;
                if (process.env.NODE_ENV == "development") {
                    console.log("DEVELOPMENT TOKEN");
                    $Authentication.id = this.clientTokens[this.currentClient].uid;
                    $Authentication.token.auth = this.clientTokens[this.currentClient].token;
                };
                this.socket = socketCluster.connect({
                    query: {
                        uid: String($Authentication.id),
                        token: $Authentication.token.auth
                    },
                    port: 8000,
                    hostname: location.hostname
                });
                this.socket.on("99", data => this.handleInit(data));
            },
            handleInit (data) {
                switch (data.state) {
                    // caso seja overworld
                    case 0: {
                        this.gameInstance.scene.start("boot", {
                            // state que vai chamar
                            state: "overworld",
                            // dependencias primárias
                            data: {
                                CurrentMap: data.param.map,
                                CurrentMonsters: data.param.monsters,
                                CurrentItems: data.param.items
                            },
                            socket: this.socket,
                            // infos do jogador
                            auth: {
                                uid: $Authentication.uid
                            },
                            player: {
                                sprite: data.param.sprite,
                                position: {
                                    facing: data.param.position.facing,
                                    x: Number(data.param.position.x),
                                    y: Number(data.param.position.y)
                                },
                                stop: false,
                                stepFlag: 0,
                                moveInProgress: false
                            },
                            // notificações
                            notify: data.param.notify,
                            // se está esperando monstro selvagem e flag do mapa e outros complementares
                            wild: data.param.wild,
                            flag: data.param.flag,
                            tamers: data.param.tamers,
                            // manager de conexão e audio
                            manager: {
                                audio: null,
                                connection: {
                                    overworld: false,
                                    battle: false,
                                    battleComplementar: false
                                }
                            },
                            // elemento
                            $el: this.$el,
                            // controlador de eventos
                            $eventBus: this.eventBus
                        });
                        break;
                    };
                    // caso seja batalha
                    case 1: {
                        this.gameInstance.scene.start("boot", {
                            // state que vai chamar
                            state: "battle",
                            
                            // dependencias primárias
                            data: {},
                            socket: this.socket,
                            // infos do jogador
                            auth: {
                                uid: $Authentication.uid
                            },
                            // parâmetros da batalha
                            param: data.param,
                            // manager de conexão e audio
                            manager: {
                                audio: null,
                                connection: {
                                    overworld: false,
                                    battle: false,
                                    battleComplementar: false
                                }
                            },
                            // elemento
                            $el: this.$el,
                            // controlador de eventos
                            $eventBus: this.eventBus
                        });
                        break;
                    };
                }
            }
        }
    }
</script>

<style scoped>
    #game {
        position: absolute;
    }
    #chat {
        position: absolute;
        left: 0;
        width: 100%;
        z-index: 999;
        color: #fff;
        top: 50%;
        margin-top: -25px;
        user-select: none;
    }
    #chat input {
        outline: 0;
        text-indent: 10px;
        font-family: 'Avant Garde', Avantgarde, 'Century Gothic', CenturyGothic, AppleGothic, sans-serif;
        width: 100%;
        height: 50px;
        font-size: 1.45em;
        background: rgba(0, 0, 0, 0.1);
        left: 0;
        color: #fff;
        z-index: 999;
        display: none;
        border: 0;
        text-align: center;
    }
    [placeholder]:focus::-webkit-input-placeholder {
        color: #fff;
        transition: opacity 0.5s 1s ease;
        opacity: 0;
    }
    [placeholder]:focus::-moz-input-placeholder {
        color: #fff;
        transition: opacity 0.5s 1s ease;
        opacity: 0;
    }
</style>