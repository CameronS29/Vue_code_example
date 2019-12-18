import { mapGetters } from 'vuex';
import { sortBy } from 'lodash';
import { DateTime } from 'luxon';
import LocalZone from 'luxon/src/zones/localZone';
import * as consts from 'store/modules/scheduling/consts';

export const pairRecordsMixin = {
  computed: {
    ...mapGetters('scheduling/calendar/pairBinding', ['activePilot', 'isActivePilotSIC']),
  },
  data() {
    return { consts };
  },
  methods: {
    handleEditPairingClick(id) {
      this.$emit('edit-pairing-click', { id });
    },

    handleAddPairingClick(pairing, type) {
      if (this.readOnly) return;

      this.$emit('add-pairing-click', {
        pairing,
        type,
      });
    },

    handleDeletePairingClick(pairing) {
      this.$emit('delete-pairing-click', pairing);
    },
    PICAssigned(pair) {
      return pair.pilot || (pair.record && pair.record.pilot);
    },
    SICAssigned(pair) {
      return pair.sic || (pair.record && pair.record.sic);
    },
    getWarningMessages(pair) {
      const PIC = this.PICAssigned(pair);
      const SIC = this.SICAssigned(pair);
      return [
        PIC ? `PIC is currently ${this.PICName(pair)}.` : 'PIC is available for this Flights.',
        SIC ? `SIC is currently ${this.SICName(pair)}.` : 'SIC is available for this Flights.',
      ];
    },
    PICRelatedWarningMsg(pair) {
      return this.getWarningMessages(pair)
        .join(' ');
    },
    SICRelatedWarningMsg(pair) {
      return this.getWarningMessages(pair)
        .reverse()
        .join(' ');
    },
    showPICAssignBtn() {
      if (this.isActivePilotSIC) return false;

      return !!this.activePilot;
    },
    showSICAssignBtn() {
      return !!this.activePilot;
    },
    isActivePilotAssignedPIC(pair) {
      const PIC = this.PICAssigned(pair);
      return PIC && (PIC.id === this.activePilot.pilot.id);
    },
    isActivePilotAssignedSIC(pair) {
      const SIC = this.SICAssigned(pair);
      return SIC && (SIC.id === this.activePilot.pilot.id);
    },
    PICBtnType(pair) {
      if (this.PICAssigned(pair) && !this.isActivePilotAssignedPIC(pair)) return 'warning';
    },
    SICBtnType(pair) {
      if (this.SICAssigned(pair) && !this.isActivePilotAssignedSIC(pair)) return 'warning';
    },
    sortFlights(flights) {
      return sortBy(flights, 'scheduled_departure');
    },
    PICName(pair) {
      const PIC = this.PICAssigned(pair);

      return `${PIC.first_name[0]}. ${PIC.last_name}`;
    },
    SICName(pair) {
      const SIC = this.SICAssigned(pair);

      return `${SIC.first_name[0]}. ${SIC.last_name}`;
    },
    PICBtnClasses(pair) {
      return {
        'pairing-list__assign-btn': true,
        'pairing-list__assign-btn_disabled': this.isActivePilotAssignedPIC(pair),
      };
    },
    SICBtnClasses(pair) {
      return {
        'pairing-list__assign-btn': true,
        'pairing-list__assign-btn_disabled': this.isActivePilotAssignedSIC(pair),
      };
    },
  },
};

const convert = (time, showDate) => DateTime.fromISO(time, { setZone: true })
  .setZone(LocalZone.instance, { keepLocalTime: true })
  .toFormat(showDate ? 'MM/dd/yyyy, HH:mm' : 'HH:mm');

export const reserveRecordsMixin = {
  methods: {
    formatTime(row, showDate = false) {
      return `${convert(row.duty_on, showDate)}Z → ${convert(row.duty_off, showDate)}Z`;
    },

    getIata(row) {
      const airport = this.byId(row.base);
      return airport ? airport.iata : null;
    },
  },
};
