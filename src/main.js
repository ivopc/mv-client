import Vue from "vue";
import App from "./App";
import router from "./router";
import store from "./store";
import "./mixins";

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import "@fortawesome/fontawesome-free/css/all.css";
import "@fortawesome/fontawesome-free/js/all.js";

import "./assets/css/style.css";

Vue.config.productionTip = false;

Vue.prototype.eventBus = new Vue();

router.beforeEach((to, from, next) => {
    document.title = to.meta.title;
    next();
});

new Vue({
    el: "#app",
    router,
    store,
    render: h => h(App)
});