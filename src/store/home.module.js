import $http from "@/api";

const state = {
    player_data: {}
};

const getters = {
    player_data (state) {
        return state.player_data;
    }
};

const actions = {
    fetchPlayerData (context) {
        console.log("Dispatchou");

        $http.post("/routes/index", {
            auth: $Authentication.token.csrf
        })
            .then(response => {
                context.commit("SET_PLAYER_DATA", response.data);
            });

    }
};

const mutations = {
    SET_PLAYER_DATA (state, data) {
        state.player_data = data;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
