import Vue from "vue";
import Router from "vue-router";

import Index from "@/views/Index";
import Play from "@/views/Play";
import Profile from "@/views/Profile";
import SpecificProfile from "@/views/SpecificProfile";
import PremiumMarket from "@/views/PremiumMarket";
import Community from "@/views/Community";
import Statistics from "@/views/Statistics";
import Config from "@/views/Config";
import Logout from "@/views/Logout";

const lazyLoad = function (view) {
    return () => import(`@/views/${view}.vue`);
};

Vue.use(Router);

export default new Router({
    mode: "history",
    routes: [
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
    ]
});