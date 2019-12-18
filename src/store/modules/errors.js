export const ADD_ERROR  = "ADD_ERROR";

const state = {
    errors: [],
};

const getters = {
    errors: state => state.errors
};


const mutations = {
    [ADD_ERROR](state, {title, text}) {
        state.errors.push({title: title, text: text, display: true});
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations
}
