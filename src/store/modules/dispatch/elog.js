import elogApi from '../../../api/elog';

const SET_STATUS = 'SET_STATUS';
const RESET_STATUS = 'RESET_STATUS';

export default {
  namespaced: true,

  state: {
    taskId: '',
    status: ''
  },

  getters: {
    status: state => state.status,
  },

  actions: {
    startDownload({commit}, params) {
      commit(RESET_STATUS);
      return elogApi.startDownload(params)
        .then(res=>commit(SET_STATUS, res));
    },
    getDownloadStatus({commit, state}) {
      return elogApi.getDownloadStatus(state.taskId)
        .then(res=>{commit(SET_STATUS, res); return res;});
    }
  },

  mutations: {
    [SET_STATUS](state, res) {
      state.taskId = res.id;
      state.status = res.state;
    },
    [RESET_STATUS](state) {
      state.taskId = '';
      state.status = '';
    }
  },
};
