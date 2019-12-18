import confirm from './confirm';
import deleteManifest from './delete';
import tables from './tables';
import elog from './elog';
import flightList from './flight-list';
import flightDaily from './flight-daily';
import eChecklist from './e-checklist';

export default {
  namespaced: true,
  modules: {
    tables,
    elog,
    confirm,
    'delete': deleteManifest,
    'flight-list': flightList,
    'flight-daily': flightDaily,
    'e-checklist': eChecklist,
  },
};
