import {INC_LOAD, SET_RESULTS, DEC_LOAD} from "../../factory/table";
import api from "../../../api/state";
import filter from 'lodash/filter';
import pickBy from 'lodash/pickBy';
import keyBy from 'lodash/keyBy';
import flatMap from 'lodash/flatMap';

const SET_SWAPS = "SET_SWAPS";


export default {
  state: {
    swaps: [],
  },
  getters: {
    swapMap: state => keyBy(filter(state.swaps, swap => !!swap.last_log), swap => swap.last_log),
    results: (state, getters) => flatMap(state.results, result => {
      if (result.log && getters.swapMap[result.log.id]) {
        return [
          {swap: getters.swapMap[result.log.id]},
          {state: result},
        ]
      } else {
        return {state: result}
      }
    })
  },
  actions: {
    getResults({commit}, {filters, ...params}) {
      const valuableParams = pickBy(
        {...filters, ...params},
        p => (p || p === 0),
      );

      commit(INC_LOAD);
      api.getSwaps(valuableParams)
        .then(data => commit(SET_SWAPS, data));
      return api.getFilteredResults(valuableParams)
        .then(({results, count}) => commit(SET_RESULTS, {results, count}))
        .finally(() => commit(DEC_LOAD));
    },
  },
  mutations: {
    [SET_SWAPS](state, swaps) {
      state.swaps = swaps;
    },
  }
};
