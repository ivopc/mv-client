var state = {
    uid: null,
    csrf_token: null,
    auth_token: null
};

const getters = {
    uid (state) {
        return state.uid;
    },
    csrf_token (state) {
        return state.csrf_token;
    },
    auth_token (state) {
        return state.auth_token;
    }
};

const actions = {
    getAuth (context) {
        axios.get("https://jsonplaceholder.typicode.com/users/1")
            .then((response) => {
                context.commit("SET_AUTH", response.data);
            })
            .catch(err => console.log("Erro: ", err))
    }
};

const mutation = {
    SET_AUTH (state, auth) {

    }
};

export default {
    state,
    getters,
    actions,
    mutations
};
