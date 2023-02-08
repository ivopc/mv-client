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
            containerId: "game",
            /**
             * @var
             * @type {GameManagerObject}
             */
            game: {
                inited: false,
                booted: false,
                instance: null,
                network: null
            },
            debug: {
                currentClient: 0,
                clientTokens: [
                    {
                        userId: "1",
                        token: "snfQd1h05KxOjdAhuOVy8VFmmpIhWBpUrEATQLwWWk8p2Uzlnq8MLl2ZxIQDCzc9nVaPRt20RK0YSqwZtk9BnOKTwpDZ5wqdVsfd45djfZSV9i9OnqwCesIqaFhc3y6HuR8RAEVb511bp7zgiDAwfZ"
                    },
                    {
                        userId: "2",
                        token: "eYGrxqByiJ61Y7trwdaSrlUoF4aFDA945FmWFPTWH0ARDk8b8AmAFm9jpiUt7FmQdsY52vLnTnrkC5zsTbJXJG0JMNBJLI0PmT8c4htyzQCwtvJBMtBPWErVnGkpFQ1QYOAqrGmhITZd3IVpKV6Pqv"
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
                if (this.game.inited) {
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
                this._debug();
                this.eventBus.$emit("hide-elements");
                const [ game, Network ] = await Promise.all([
                    import("@/game"),
                    import("@/game/managers/Network")
                ]);
                this.setNetwork(Network);
                this.game.instance = game.createInstance(this.containerId);
                this.game.inited = true;
                await this.waitGameConn();
                const bootData = await this.getGameBootData();
                game.boot(bootData);
                this.game.booted = true;
            },
            setNetwork (network) {
                const ntwk = network.default;
                ntwk.ref = new ntwk();
                this.game.network = ntwk.ref;
            },
            async waitGameConn () {
                this.game.network.setAuth({
                    userId: String($Authentication.id),
                    token: $Authentication.token.auth
                });
                this.game.network.startConn();
                await this.game.network.waitConn();
            },
            getGameBootData () {
                return this.game.network.getGameBootData();
            },
            _debug () {
                if (process.env.NODE_ENV !== "development")
                    return;
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
