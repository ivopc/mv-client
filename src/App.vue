<template>
    <div id="app">
        <div class="row" v-if="!hidden">
            <cHeader />
            <router-view></router-view>
        </div>
        <GameClient />
    </div>
</template>

<script>
    import Loader from "@/components/Loader";
    import cHeader from "@/components/Header";
    import GameClient from "@/components/GameClient";

    export default {
        name: "App",
        components: {
            cHeader,
            GameClient
        },
        data: () => ({
            hidden: false
        }),
        created () {
            this.eventBus.$on("show-elements", () => {
                this.hidden = false;
            });
            this.eventBus.$on("hide-elements", () => {
                this.hidden = true;
            });
        }
    }
</script>

<style>
    
    @import url("https://fonts.googleapis.com/css2?family=Merriweather:wght@300&family=Quicksand:wght@300&display=swap");

    #app {
        height: 100%;
        min-width: 100%;
    }
</style>
