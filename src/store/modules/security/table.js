import createTableStore from '../../factory/table';
import { securityListApi } from '../../../api/security';
// import socketsMixin from './sockets';


export default {
  namespaced: true,
  modules: {
    securityItems: createTableStore(securityListApi),
  },
};
