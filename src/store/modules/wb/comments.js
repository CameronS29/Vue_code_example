import commentsApi from '../../../api/wb/comments';

export const SET_COMMENTS  = 'SET_COMMENTS';
export const SET_TEXT  = 'SET_TEXT';
export const RESET_COMMENT  = 'RESET_COMMENT';

const state = {
  comments: [],
  comment: {}
};

const getters = {
  comment: state => state.comment,
  comments: state => state.comments,
};

const actions = {
  getComments({ commit, rootState }) {
    return commentsApi.getComments(rootState.wb.log.id)
      .then(data => commit(SET_COMMENTS, data));
  },
  pushComment({ state, rootState, dispatch, commit }) {
    return commentsApi.pushComment(rootState.wb.log.id, state.comment)
      .then(() => commit(RESET_COMMENT))
      .then(() => dispatch('getComments'));
  },
};

const mutations = {
  [SET_COMMENTS](state, data) {
    state.comments = data;
  },
  [SET_TEXT](state, text) {
    state.comment.text = text;
  },
  [RESET_COMMENT](state) {
    state.comment = {};
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
