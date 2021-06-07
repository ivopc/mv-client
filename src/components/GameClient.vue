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
    export default {
        name: "GameClient",
        data: () => ({
            game: false,
            containerId: "game",
            gameInstance: null,
            socket: null,
            debug: {
                currentClient: 0,
                clientTokens: [
                    {
                        userId: "1",
                        token: "pq4jyKzCtItKr766LMSfPzimoz8ib3b4HBihyK8ftVWiKhoS75ZVj7kEXqCBsPTuOqiNLSwxDWMWlnycdt7U44aVC87uF4GwsOKhYlo4Mft11MbcErg9It6C1zlSh3Psxmm8BrU8FR03wgqc8Yw7pQ"
                    },
                    {
                        userId: "2",
                        token: "1JGP6qZDitqpR86OPDYBwfcgXcL6nvV521v1aCxE9iDNmBQswElHwq34QchvHMey8CoILhNXuuDyWGYFma110ijt6EdtdFqpUqKfu5334fBjK9ELWjLcJfLE6627T217nqDbG8GU3CuvRJEe8qRWx5"
                    }
                ]
            }
        }),
        created () {
            this.eventBus.$on("call-client", this.callClient);
            this.eventBus.$on("hide-client", this.hideClient);
            this.eventBus.$on("back-to-app", this.backToApp);
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
            backToApp (data) {
                // remove event to do not duplicate the call
                this.eventBus.$off("call-client");
                this.hideClient();
                this.eventBus.$emit("show-elements");
                this.$router.push({name: data.name});
                // recreate event again
                this.eventBus.$on("call-client", this.callClient);
            },
            async appendGameClient () {
                this.eventBus.$emit("hide-elements");
                const game = await import("@/newgame");
                game.createInstance(this.containerId);
                this.gameStarted = true;
                if (process.env.NODE_ENV == "development")
                    this._debug();
                console.time("get gameboot data");
                const bootData = await this.waitGameConn();
                console.timeEnd("get gameboot data");
                game.boot(bootData);
            },
            async waitGameConn () {
                // TODO: need to create a wrapper to socket reference
                const [ socketCluster, Network ] = await Promise.all([
                    import("socketcluster-client"),
                    import("@/newgame/managers/Network")
                ]);
                // 
                const ntwk = Network.default;
                ntwk.ref = new ntwk(socketCluster);
                ntwk.ref.setAuth({
                    userId: String($Authentication.id),
                    token: $Authentication.token.auth
                });
                ntwk.ref.startConn();
                console.time("init conexão");
                await ntwk.ref.waitConn();
                console.timeEnd("init conexão");
                return await ntwk.ref.getGameBootData();
            },
            _debug () {
                const { debug } = this;
                $Authentication.id = debug.clientTokens[debug.currentClient].userId;
                $Authentication.token.auth = debug.clientTokens[debug.currentClient].token;
                return;
                const current = localStorage.getItem("auth");
                let token;
                if (!current || current == "0") {
                    token = this.clientTokens[0];
                    localStorage.setItem("auth", "1");
                } else {
                    token = this.clientTokens[1];
                    localStorage.setItem("auth", "0");
                };
                return token;
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
