import {FLIGHT_STATUS_CLASS} from "../../../../store/modules/dispatch/status-change";
import {find} from "lodash";
import delay from "../utils/delay";

export default {
  methods: {
    ...delay,
    getStatusClass(status) {
      return FLIGHT_STATUS_CLASS[status];
    },
    getStatusBtnClass(status){
      let statusClass = {
        "flight-list-table__status-btn": true
      };
      statusClass["flight-list-table__status-btn_" + this.getStatusClass(status)] = true;
      return statusClass;
    },
    getStatusBtnType(flight) {
      if (!flight.status) return 'info';

      return this.ERROR_STATUSES.indexOf(flight.status) > -1 ? 'danger' : 'primary';
    },
    getOfficialCode(flight) {
      const code = find(this.availableOfficialCodes, { id: flight.official_code });
      return code ? code.code : '';
    },
    getStatusBtnTitle(flight) {
      if (!flight.status) return 'Not specified';
      if (flight.is_delayed && flight.status === 5) {
        return 'Scheduled';
      }
      if (this.ERROR_STATUSES.indexOf(flight.status) === -1) {
        return this.availableFlightStatuses[flight.status];
      }
      return `${this.availableFlightStatuses[flight.status]} ${this.getOfficialCode(flight)}`;
    },
  },
};

