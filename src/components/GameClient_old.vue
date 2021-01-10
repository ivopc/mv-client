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

                this.eventBus.$emit("hide-element");
                this.gameStarted = true;
                const $Authentication = {token: {}};


                    $Authentication.uid = this.clientTokens[this.currentClient].uid;
                    $Authentication.auth = this.clientTokens[this.currentClient].token;
                
                const game = await import("@/game/game");


               this.gameInstance = game.launch(
                    this.containerId
                );

                this.socket = socketCluster.connect({
                    query: {
                        uid: String($Authentication.uid),
                        token: $Authentication.auth
                    },
                    port: 8000
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
                                walkInProgress: false
                            },

                            // se está esperando monstro selvagem e flag do mapa e outros complementares
                            wild: data.param.wild,
                            flag: data.param.flag,
                            tamers: data.param.tamers,
                            notify: data.param.notify,

                            // manager de conexão e audio
                            manager: {
                                audio: null,
                                connection: {
                                    overworld: false,
                                    battle: false
                                }
                            },

                            // elemento
                            $el: this.$el
                        });
                        break;
                    };

                    // caso seja batalha
                    case 1: {
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
