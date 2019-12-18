import pairings from './pairings';
import pairingTemplates from './pairing-templates';
import revisions from './revisions';
import calendar from './calendar';
import assignedFlights from './assignedFlights';
import flightAddition from './flight-addition';
import gantt from './gantt';
import openTime from './open-time';
import crewCurrency from './crewCurrency';

export default {
  namespaced: true,
  modules: {
    calendar,
    pairings,
    pairingTemplates,
    revisions,
    assignedFlights,
    flightAddition,
    gantt,
    openTime,
    crewCurrency,
  },
};
