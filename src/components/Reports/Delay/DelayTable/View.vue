<script>
  import { mapGetters, mapActions } from 'vuex';
  import { find, throttle } from 'lodash';

  import subDays from 'date-fns/subDays';
  import startOfDay from 'date-fns/startOfDay';
  import endOfDay from 'date-fns/endOfDay';
  import toDate from 'date-fns/toDate';
  import { queryGetter } from 'utils/routers';

  import Block from 'Common/Block.vue';
  import Icon from 'Common/Icon.vue';

  import FlightDetails from '../../../Flight/Status/FlightDetails.vue';
  import ReportTable from './ReportTable.vue';

  export default {
    name: 'DelayDashboard',

    components: {
      Block,
      Icon,
      ReportTable,
      FlightDetails,
    },

    created() {
      this.getFilters();
      this.getReportData();
    },

    computed: {
      ...mapGetters('reports/delay', ['isLoading', 'reportRecords']),
      ...mapGetters('reports/onTime', ['airports']),

      groupby: queryGetter('groupby', 'station'),
      dateFrom: queryGetter('date_from', subDays(startOfDay(new Date()), 7), toDate),
      dateTo: queryGetter('date_to', endOfDay(new Date()), toDate),
    },

    methods: {
      ...mapActions('reports/delay', ['getReport']),
      ...mapActions('reports/onTime', ['getFilters']),

      getReportData() {
        return this.getReport({
          date_from: this.dateFrom,
          date_to: this.dateTo,
          groupby: this.groupby,
        });
      },

      tableTitle(iata) {
        if (this.groupby !== 'station') {
          return iata;
        }
        const airport = find(this.airports, { iata });
        return (airport !== undefined
          ? `${airport.name} (${iata})`
          : iata);
      },

      handleFilterChange: throttle(function () {
        this.getReportData();
      }),
    },

    watch: {
      dateFrom: 'handleFilterChange',
      dateTo: 'handleFilterChange',
    },
  };
</script>

<template>
  <div class="reports-delay" :v-loading="isLoading">
    <report-table v-for="record in reportRecords"
                  :title="tableTitle(record.title)"
                  :data="record.data"
                  :key="record.title" />

    <div class="reports-delay__empty" v-if="reportRecords.length === 0">
      <icon glyph="file-o" size="4x" />
      <div class="reports-delay__empty-content">
        <h3 class="reports-delay__title">Report is Empty.</h3>
        <h4 class="reports-delay__title reports-delay__title_light">
          There's no delayed flights on given date range.
        </h4>
      </div>
    </div>

    <flight-details />
  </div>
</template>

<style lang="scss">
  .reports-delay {
    flex: 1;
    position: relative;
    display: flex;
    flex-flow: column;

    &__empty {
      margin: auto;
      position: relative;

      display: flex;
      align-content: center;
      justify-content: center;
    }

    &__title {

      &_light {
        font-weight: normal;
        font-size: .7em;
      }
    }

    &__empty-content {
      font-size: 1.3em;
      margin: 6px 0 0 10px;
    }
  }
</style>

