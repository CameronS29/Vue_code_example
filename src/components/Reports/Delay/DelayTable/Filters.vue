<script>
  import subDays from 'date-fns/subDays';
  import startOfDay from 'date-fns/startOfDay';
  import endOfDay from 'date-fns/endOfDay';
  import toDate from 'date-fns/toDate';

  import Icon from 'Common/Icon.vue';
  import { DatePicker, Button } from 'element-ui';
  import { queryParam } from 'utils/routers';

  export default {
    name: 'Filters',
    components: {
      ElButton: Button,
      DatePicker,
      Icon,
    },

    computed: {
      dateFrom: queryParam({
        param: 'date_from',
        defaultValue: subDays(startOfDay(new Date()), 7),
        dump: date => date.toISOString(),
        load: toDate,
      }),

      dateTo: queryParam({
        param: 'date_to',
        defaultValue: endOfDay(new Date()),
        dump: date => date.toISOString(),
        load: toDate,
      }),

      dateRange: {
        get() {
          return [this.dateFrom, this.dateTo];
        },
        set([dateFrom, dateTo]) {
          this.dateFrom = startOfDay(dateFrom);
          this.dateTo = endOfDay(dateTo);
          this.$emit('change');
        },
      },
    },
  };
</script>

<template>
  <date-picker size="small" type="daterange" v-model="dateRange" />
</template>

<style lang="scss">
  .reports-delay__filters {
    display: flex;

    & > * {
      margin-left: 5px;
    }
  }
</style>
