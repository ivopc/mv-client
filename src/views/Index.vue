<template>
    <div class="col-md-8">
        <h1 class="border-bottom pb-4 mb-4 mt-4">{{wordlist.navbar["HOME"][lang]}}</h1>
        <p>{{ injectWords(wordlist.home["SHOW"][lang], {nickname: player_data.nickname}) }}</p>
        <p>{{ wordlist.home["SHOW2"][lang] }}</p>
        <div class="card text-white bg-dark mb-3 mt-3 text-center">
            <div class="card-body">
                {{ player_data.nickname }} - {{ player_data.rank }}
            </div>
        </div>
        <div class="row d-flex justify-content-center" v-for="monsters in groupedTeam">
                <div class="col-md-4" v-for="(monster, index) in monsters" :key="index" style="width: 100%;">
                        <div class="card text-white bg-dark mb-3 text-center">

                        <div class="card-header">{{ monster.id }} - Lv. {{ monster.level }}</div>
                        <div class="card-body">
                            <p class="card-text"><img class="center-monster" src="charmeleon.gif"></p>
                        </div>
                    </div>
                </div>
        </div>
    </div>


</template>

<script>
    import { mapGetters } from "vuex";
    import _ from "lodash";

    import lang from "@/lang";

    export default {
        name: "Index",
        mounted () {
            console.log(this.wordlist);
            console.log(this.lang);
            this.$store.dispatch("fetchPlayerData");
        },
        created () {
            //this.$router.push({name: "Community"});
        },
        computed: {
            ...mapGetters(["player_data"]),
            groupedTeam () {
                return _.chunk(this.player_data.team, 3);
            }
        }
    }
</script>

<style type="text/css" scoped>
    
</style>

