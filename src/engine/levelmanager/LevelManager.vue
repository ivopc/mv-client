<template>
<div>
    Level Manager test
    <ul id="level-list" class="list-group" v-for="level in levelList">
        <li class="list-group-item">{{ level.name }}</li>
    </ul>
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
        }
    }
}
</script>

<style lang="css" scoped>
    #level-list {
        color: #000;
    }
</style>