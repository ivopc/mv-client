import Vue from "vue";
import Router from "vue-router";

const lazyLoad = view => () => import(`@/views/${view}.vue`);

Vue.use(Router);

const routes = [
    {
        path: "/",
        name: "Index",
        component: lazyLoad("Index"),
        meta: {
            title: "Monster Valle"
        }
    },
    {
        path: "/play",
        name: "Play",
        component: lazyLoad("Play"),
        meta: {
            title: "Monster Valle - Play"
        }
    },
    {
        path: "/profile",
        name: "Profile",
        component: lazyLoad("Profile"),
        meta: {
            title: "Monster Valle - Perfil"
        }
    },
    {
        path: "/profile/:id",
        name: "SpecificProfile",
        component: lazyLoad("SpecificProfile")
    },
    {
        path: "/premium",
        name: "PremiumMarket",
        component: lazyLoad("PremiumMarket"),
        meta: {
            title: "Monster Valle - Premium Market"
        }
    },
    {
        path: "/community",
        name: "Community",
        component: lazyLoad("Community"),
        meta: {
            title: "Monster Valle - Comunidade"
        }
    },
    {
        path: "/statistics",
        name: "Statistics",
        component: lazyLoad("Statistics")
    },
    {
        path: "/config",
        name: "Config",
        component: lazyLoad("Config"),
        meta: {
            title: "Monster Valle - Configurações" 
        }
    },
    {
        path: "/logout",
        name: "Logout",
        component: lazyLoad("Logout")
    }
];

/*if (process.env.NODE_ENV == "development") {
    routes.push(
        {
            path: "/levelmanager",
            name: "LevelManager",
            component: () => import("@/engine/levelmanager/LevelManager.vue"),
            meta: {
                title: "DEVMODE - Level Manager"
            }
        }
    );
};*/


export default new Router({ mode: "history", routes });