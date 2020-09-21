import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

import home from "./home.module";
import profile from "./profile.module";

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        home
    },
    strict: process.env.NODE_ENV !== "production"
});