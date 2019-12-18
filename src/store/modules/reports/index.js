import onTime from './onTime';
import delay from './delay';
import t100 from './t100';
import delayGantt from './delay-gantt';

export default {
  namespaced: true,
  modules: {
    onTime,
    delay,
    'delay-gantt': delayGantt,
    t100
  },
};
