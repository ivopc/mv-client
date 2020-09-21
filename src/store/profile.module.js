import $http from "@/api";

const state = {
    profile: {}
};

const getters = {
    profile_data (state) {
        return state.profile;
    }
};

const actions = {
    fetchProfile (context) {

        $http.post("/routes/profile", {
            auth: $Authentication.csrf
        })
            .then(response => {
                context.commit("SET_PROFILE_DATA", response.data);
            });
    }
};

const mutations = {
    SET_PROFILE_DATA (state, data) {
        state.profile = data;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
