<script>
  import { DateTime, Duration } from 'luxon';
  import { DatePicker } from 'element-ui';
  import GenericCommunity from './GenericCommunity.vue';

  import {queryParam} from '../../../../utils/routers';
  import dateOffsetMixin from './dateOffsetMixin';

  const dateFormat = 'MM/dd/yyyy';
  const moveDate = (date, tz) => date.setZone(tz, {keepCalendarTime: true})
    .startOf('day');

  const dateTimeParam = ({name, date}) => queryParam({
    param: name,
    defaultValue: date,
    load(dateStr) {
      return moveDate(DateTime.fromString(dateStr, dateFormat), this.tzOffset);
    },
    dump(dateTime) {
      return dateTime.toFormat(dateFormat);
    },
  });

  export default {
    name: 'Weekly',

    mixins: [dateOffsetMixin(0)],

    components: {
      GenericCommunity,
      DatePicker,
    },

    computed: {
      timeZone: queryParam({
        param: 'tz',
        defaultValue: 'PST',
      }),

      dateFrom: dateTimeParam({
        name: 'from',
        date() {
          return this.dateTo.minus(Duration.fromObject({days: 7}));
        },
      }),

      dateTo: dateTimeParam({
        name: 'to',
        date() {
          return moveDate(DateTime.utc(), this.tzOffset);
        },
      }),

      pickerRange: {
        get() {
          return [
            this.dateFrom.toJSDate(),
            this.dateTo.minus(Duration.fromObject({days: 1})).toJSDate(),
          ];
        },
        set([dateFrom, dateTo]) {
          this.dateFrom = moveDate(DateTime.fromJSDate(dateFrom), this.tzOffset);
          this.dateTo = moveDate(
            DateTime.fromJSDate(dateTo).plus(Duration.fromObject({days: 1})),
            this.tzOffset,
          );
        },
      },
    },
  };
</script>

<template>
  <generic-community
    :date-from="dateFrom"
    :date-to="dateTo"
    :time-zone="timeZone"
    @tz-change="setTimeZone"
    title="Custom Date Range"
  >
    <div class="on-time-custom__filters" slot="head-after">
      Date range:
      <date-picker
        class="on-time-custom__picker"
        v-model="pickerRange"
        type="daterange"
        align="right"
        size="small"
        format="MM/dd/yyyy"
        placeholder="Pick a range"
      />
    </div>
  </generic-community>
</template>

<style lang="scss" scoped>
  .on-time-custom {
    &__filters {
      display: flex;
      align-items: center;
    }

    &__picker {
      margin-left: 10px;
    }
  }
</style>
