<template>
    <div class="col-md-2">
        {{ kebab }}
        <nav class="navbar navbar-expand-lg navbar-dark mt-3">
            <button class="navbar-toggler ml-auto" type="button" data-toggle="collapse" data-target="#navbar">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbar">
                <ul class="navbar-nav flex-column ml-2" id="valle-nav-bar">
                    <li class="nav-item pb-2 mt-2">
                        <router-link to="/play" type="button" class="btn btn-outline-danger btn-block">{{wordlist.navbar["PLAY"][lang]}}</router-link>
                    </li>                            
                    <li class="nav-item pb-2 mt-2">
                        <router-link to="/" type="button" class="btn btn-outline-light btn-block">{{ wordlist.navbar["HOME"][lang] }}</router-link>
                    </li>
                    <li class="nav-item pb-2 mt-2">
                        <router-link to="/premium" type="button" class="btn btn-outline-light btn-block">{{ wordlist.navbar["PREMIUM_MARKET"][lang] }}</router-link>
                    </li>
                    <li class="nav-item pb-2 mt-2">
                        <a href="/marketplace" type="button" target="_blank" class="btn btn-outline-light btn-block">{{wordlist.navbar["MARKET_PLACE"][lang] }}</a>
                    </li>
                    <li class="nav-item pb-2 mt-2">
                        <router-link to="/community" type="button" class="btn btn-outline-light btn-block">{{ wordlist.navbar["COMMUNITY"][lang] }}</router-link>
                    </li>
                    <li class="nav-item pb-2 mt-2">
                        <router-link to="/config" type="button" class="btn btn-outline-light btn-block">{{ wordlist.navbar["CONFIG"][lang] }}</router-link>
                    </li>
                    <li class="nav-item pb-2 mt-2">
                        <router-link to="/logout" type="button" class="btn btn-outline-light btn-block">{{ wordlist.navbar["LOGOUT"][lang]}}</router-link>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
</template>

<script>
    import lang from "@/lang";
    export default {
        name: "Header",
        created () {
        },
        mounted () {},
        methods: {}
    }
</script>

<style scoped>
    #valle-nav-bar {
        width: 100%;
        margin: 0 auto;
        position: relative;
    }
</style>