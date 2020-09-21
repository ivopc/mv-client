<template >
    <div class="col-md-8">
        <h1 class="border-bottom pb-4 mb-4 mt-4">
            {{ title }}
        </h1>
        <div>
            <router-link to="/" class="link">Link</router-link>
        </div>
        Bem-vindo ao Premium Market.
    </div>
</template>

<script>
    import async from "async";
    export default {
        name: "PremiumMarket",
        data: () => ({
            title: "Premium Market"
        }),
        methods: {}
    }
</script>

<style type="text/css" scoped>
    .link {
        color: #ff0;
    }
</style>
