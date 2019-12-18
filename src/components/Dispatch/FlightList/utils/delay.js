import {get} from 'lodash';

import {DateTime} from 'luxon';

const NA_VALUE = '—';
const DELAY_MARGIN = 15; // minutes

const parse = date => DateTime.fromISO(date)
  .setZone('UTC');

export default {
  getDepartureDelayMinCount(flight) {
    let dateTimeOut = get(flight, 'flightlog.actual_datetime_out');
    if (!dateTimeOut) dateTimeOut = get(flight, 'estimated_departure');
    if (!dateTimeOut) return NA_VALUE;

    const {minutes: diff} = parse(dateTimeOut)
      .diff(parse(this.flight.scheduled_departure), ['minutes']);

    return diff > 0 ? parseInt(diff) : 0;
  },
  getArrivalDelayMinCount(flight) {
    let dateTimeIn = get(flight, 'flightlog.actual_datetime_in');
    if (!dateTimeIn) dateTimeIn = get(flight, 'estimated_arrival');
    if (!dateTimeIn) return NA_VALUE;

    const {minutes: diff} = parse(dateTimeIn)
      .diff(parse(flight.scheduled_arrival), ['minutes']);

    return diff > 0 ? parseInt(diff) : 0;
  },
  isDelayed(flight) {
    return this.getArrivalDelayMinCount(flight) >= DELAY_MARGIN || this.arrivalDelayMinCount(flight) >= DELAY_MARGIN;
  },
};
