import { DateTime, Duration } from 'luxon';
import get from 'lodash/get';
import find from 'lodash/find';

import { queryParam } from '../../../../utils/routers';
import { timeZones } from '../../utils';


export default (daysOffset) => ({
  computed: {
    timeZone: queryParam({
      param: 'tz',
      defaultValue: 'PST',
    }),

    dateFrom() {
      return this.dateTo.minus(Duration.fromObject({ days: daysOffset }));
    },

    dateTo() {
      return DateTime.utc()
        .startOf('day')
        .setZone(this.tzOffset, { keepCalendarTime: true });
    },

    tzOffset() {
      return get(find(timeZones, { name: this.timeZone }), 'offset');
    },
  },

  methods: {
    setTimeZone(tz) {
      this.timeZone = tz;
    },
  },
});
