import createTableStore from 'store/factory/table';
import update from 'immutability-helper';
import { findIndex, without } from 'lodash';

import * as consts from './consts';
import { tableApi } from '../../../api/flights';


const mutations = {
  [consts.ADD_FLIGHT_SHIFT](state, { flightId, shiftId }) {
    const flightIndex = findIndex(state.results, flight => flight.id === flightId);
    const pairs = state.results[flightIndex].pairs;

    state.results = update(state.results, { [flightIndex]: { $merge: { pairs: [...pairs, shiftId] } } });
  },

  [consts.REMOVE_FLIGHT_SHIFT](state, { flightId, shiftId }) {
    const flightIndex = findIndex(state.results, flight => flight.id === flightId);
    const pairs = state.results[flightIndex].pairs;

    state.results = update(state.results, { [flightIndex]: { $merge: { pairs: without(pairs, shiftId) } } });
  },
};

export default createTableStore(tableApi, { mutations });
