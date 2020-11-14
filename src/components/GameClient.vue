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
    import Boot from "@/newgame/managers/Boot";

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
                    token: "pq4jyKzCtItKr766LMSfPzimoz8ib3b4HBihyK8ftVWiKhoS75ZVj7kEXqCBsPTuOqiNLSwxDWMWlnycdt7U44aVC87uF4GwsOKhYlo4Mft11MbcErg9It6C1zlSh3Psxmm8BrU8FR03wgqc8Yw7pQ"
                },
                {
                    uid: "3",
                    token: "NmEN5wS7rmLnUrj49p24iDQmpN2tiRTsjcQOJvplkbwxmZD1bEciGGXOei8JOnkEblza1XGQjjNll4syTme7F1JofSH9QUfOcvuaOAkQGGscgwkf8sJo4nfTWP1l5bDUFHg6PhLSJCnv0n29j3yy4K"
                }
            ],
            currentClient: 0
        }),
        created () {
            this.eventBus.$on("call-client", this.callClient);
            this.eventBus.$on("hide-client", this.hideClient);
            this.eventBus.$on("navigate-to-other-pages", this.navigateToOtherPages);
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
                this.$nextTick(() => this.eventBus.$on("call-client", this.callClient));
            },
            async appendGameClient () {

                this.eventBus.$emit("hide-elements");
                
                const game = await import("@/game/game");
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

                this.socket.on("99", payload => this.handleInit(payload));
            },
            handleInit (payload) {

                new Boot(this.gameInstance, payload);
                return;

                switch (payload.state) {
                    // caso seja overworld
                    case 0: {

                        this.gameInstance.scene.start("boot", {
                            // state que vai chamar
                            state: "overworld",

                            // dependencias primárias
                            data: {
                                CurrentMap: payload.param.map,
                                CurrentMonsters: payload.param.monsters,
                                CurrentItems: payload.param.items
                            },
                            socket: this.socket,

                            // infos do jogador
                            auth: {
                                uid: $Authentication.uid
                            },
                            player: {
                                sprite: payload.param.sprite,
                                position: {
                                    facing: payload.param.position.facing,
                                    x: Number(payload.param.position.x),
                                    y: Number(payload.param.position.y)
                                },
                                stop: false,
                                stepFlag: 0,
                                moveInProgress: false
                            },

                            // notificações
                            notify: payload.param.notify,

                            // se está esperando monstro selvagem e flag do mapa e outros complementares
                            wild: payload.param.wild,
                            flag: payload.param.flag,
                            tamers: payload.param.tamers,

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
                            param: payload.param,

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
