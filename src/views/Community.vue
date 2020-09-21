<template>
    <div class="col-md-8">

        <h1 class="border-bottom pb-4 mb-4 mt-4">
            {{ wordlist.community["TITLE"][lang] }}
        </h1>
        <div class="card text-white bg-dark mb-3 mt-3 text-center">
            <div class="card-body">

                <a href="https://facebook.com/monster.valle.game/" target="_blank"><i class="fab fa-facebook-square fa-lg"></i> {{wordlist.community["FACEBOOK"][lang]}}</a>
            </div>
        </div>
        <div class="card text-white bg-dark mb-3 mt-3 text-center">
            <div class="card-body">
                <a href="https://www.facebook.com/groups/monstervalle/" target="_blank"><i class="fab fa-facebook fa-lg"></i> {{wordlist.community["FACE_GROUP"][lang]}}</a>
            </div>
        </div>
        <div class="card text-white bg-dark mb-3 mt-3 text-center">
            <div class="card-body">
                <a href="https://www.youtube.com/channel/UCmeF0sCvA1G-gly6I3hwa8w" target="_blank"><i class="fab fa-youtube fa-lg"></i> {{wordlist.community["YOUTUBE"][lang]}}</a>
            </div>
        </div>
        <div class="card text-white bg-dark mb-3 mt-3 text-center">
            <div class="card-body">
                <a href="https://discord.gg/Vs4p7x7" target="_blank"><i class="fab fa-discord fa-lg"></i> {{wordlist.community["DISCORD"][lang]}}</a>
            </div>
        </div>
        
    </div>
</template>

<script>
    import async from "async";
    export default {
        name: "Community",
        data () {
            return {}
        },
        methods: {}
    }
</script>

<style type="text/css" scoped>
    .link {
        color: #ff0;
    }

    a {
        color: #fff;
    }
</style>
