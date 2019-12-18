import JobsApi from "../../api/jobs";
export const SET_JOBBS = "SET_JOBBS";
export const SET_RESULT_JOBS = "SET_RESULT_JOBS";
export const PUSH_TO_POOL = "PUSH_TO_POOL";

const state = {
  jobs: [],
  results: [],
  pool: []
};

const getters = {
  jobs: state => state.jobs,
  results: state => state.results,
  pool: state => state.pool,
};

const actions = {
  getJobs({commit}) {
    JobsApi.listActiveJobs(jobs => {
      commit(SET_JOBBS, jobs)
    })
  },
  getJobsByUUIDs({commit, state}) {
    return JobsApi.getJobsResults(state.pool).then(jobs => {
      commit(SET_RESULT_JOBS, jobs)
    });
  }
};

const mutations = {
  [SET_JOBBS](state, jobs) {
    state.jobs = jobs;
  },
  [SET_JOBBS](state, jobs) {
    state.jobs = jobs;
  },
  [SET_RESULT_JOBS](state, results) {
    state.results = results;
    for (let job of results) {
      if (job.status === 'SUCCESS') {
        state.pool = state.pool.filter(item => item !== job.uuid);
      }
    }
  },
  [PUSH_TO_POOL](state, uid) {
    state.pool.push(uid);
  },
};

export default {
  namespaced: true,
  actions,
  state,
  getters,
  mutations
}
