<template>
<div>
    Level Manager test
    <div id="level-list" v-for="level in levelList">
        <button @click="chooseLevel(level.name)" type="button" class="btn btn-info">{{ level.id }}</button>
    </div>
</div>
</template>

<script>
import boot from "./services/get-all-levels-boot.service";
import Phaser from "phaser";
export default {
    name: "LevelManager",
    data: () => ({
        levelList: []
    }),
    mounted () {
        this.getAllLevels();
    },
    methods: {
        async getAllLevels () {
            this.levelList = await boot();
        },
        chooseLevel (name) {
            console.log("olá", name);
        }
    }
}
</script>

<style lang="css" scoped>
    #level-list {
        color: #000;
    }
</style>