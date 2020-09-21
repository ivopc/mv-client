<template>
    <div class="col-md-8">
        
    </div>
</template>

<script>
    import { mapGetters } from "vuex";
    import async from "async";
    export default {
        name: "Profile",
        mounted () {
            this.$store.dispatch("fetchProfile");
        },
        computed: {
            ...mapGetters(["profile"])
        }
    }
</script>

<style type="text/css" scoped>
    .link {
        color: #ff0;
    }
</style>
