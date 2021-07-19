export const MUTATIONS = {
    SET_AUTH: "SET_AUTH"
};

export const state = {
    userId: null,
    csrfToken: null,
    authToken: null
};

export const getters = {
    userId: ({ userId }) => userId,
    csrfToken: ({ csrfToken }) => csrfToken,
    authToken: ({ authToken }) => authToken
};

export const actions = {
    async getAuth ({ commit }) {
        let payload;
        try {
            const data = await axios.get("https://jsonplaceholder.typicode.com/users/1");
            payload = data.data;
        } catch (err) {
            throw new Error("user did not found");
            logError(err);
        };
        commit(MUTATIONS.SET_AUTH, payload);
    }
};

export const mutation = {
    [MUTATIONS.SET_AUTH] (state, auth) {

    }
};