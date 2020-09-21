<template>
    <div class="col-md-8">
        <h1 class="border-bottom pb-4 mb-4 mt-4">
            Perfil de {{ $route.params.id }}
        </h1>
    </div>
</template>

<script>
    import async from "async";
    export default {
        name: "SpecificProfile",
        data () {
            return {
                title: "SpecificProfile",
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
