import createTableStore from '../../../factory/table';
import {lastCompletedApi} from '../../../../api/flightlog';
// import socketsMixin from './sockets';


export default {
  namespaced: true,
  modules: {
    completedManifests: createTableStore(lastCompletedApi),
  },
};
