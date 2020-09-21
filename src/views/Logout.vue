<template>
    <div class="col-md-8">
        {{ title }}
        <div>
            <router-link to="/" class="link">Link</router-link>
        </div>
    </div>
</template>

<script>
    import async from "async";
    export default {
        name: "Logout",
        data () {
            return {
                title: "Logout",
            }
        },
        methods: {}
    }
</script>

<style type="text/css" scoped>
    .link {
        color: #ff0;
    }
</style>
