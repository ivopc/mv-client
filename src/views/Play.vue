<template></template>

<script>
    export default {
        name: "Play",
        data: () => ({
            title: "Jogar"
        }),
        created () {
            this.eventBus.$emit("call-client");
        }
    }
</script>

<style type="text/css" scoped>
    .link {
        color: #ff0;
    }
</style>
