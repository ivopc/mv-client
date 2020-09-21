<template>
    <div class="test">
        {{ abs }}
        <div>
            <router-link to="/logout" class="link">Link</router-link>
            <button @click="deasync">Deasync</button>
        </div>
        <div>
            <ul>
                <li v-for="user in users" @click="test(user, $event)" v-bind:key="user.id">{{ user.name }}</li>
            </ul>
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                With Bootstrap!
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
    import async from "async";
    export default {
        name: "Index",
        data () {
            return {
                abs: 123,
                users: [
                    {id: 1, name: "Ivo"},
                    {id: 2, name: "Lucas"},
                    {id: 3, name: "CriOronaldo"}
                ]
            }
        },
        methods: {
            deasync () {
                async.series([
                    (next) => {
                        console.log(1);
                        next();
                    },
                    () => {
                        console.log(2);
                    }
                ])
            },
            test (data, e) {
                console.log(data);
                console.log(e);
            }
        }
    }
</script>

<style type="text/css" scoped>
    .link {
        color: #ff0;
    }
</style>
