<script>
  import { Table, TableColumn } from 'element-ui';
  import { formatTime, percent } from '../utils';

  export default {
    name: 'RouteTable',

    props: {
      data: {
        type: Array,
        required: true,
      },

      total: {
        type: Object,
        default: null,
      },

      origin: String,
    },

    components: {
      TableEl: Table,
      TableColumn,
    },

    methods: {
      drillDownLink({ origin__iata: origin, destination__iata: destination }) {
        return {
          name: 'report_ontime_drilldown',
          params: { origin: origin || this.origin, destination },
          query: this.$route.query,
        };
      },

      onTimePerformance({ total_count, on_time_count }) {
        return on_time_count / Math.max(total_count, 1);
      },

      getTotalStats() {
        const { total } = this;
        return [
          'Total Stats',
          percent(total.performance),
          total.total_count,
          total.flown_count,
          total.on_time_count,
          total.delay_count,
          total.canceled_count,
          formatTime(total.total_delay),
          formatTime(total.avg_delay),
        ];
      },

      percent,
    },

    filters: {
      timeDelta: formatTime,
    },
  };
</script>

<template>
  <table-el
    class="on-time-table__table"
    :data="data"
    border
    :show-summary="total !== null"
    :summary-method="getTotalStats"
  >
    <slot>
      <table-column label="Route" fixed="left" width="120">
        <template slot-scope="props">
          <router-link :to="drillDownLink(props.row)" title="Drill down in log stats">
            {{ props.row.origin__iata || origin }} / {{ props.row.destination__iata }}
          </router-link>
        </template>
      </table-column>
    </slot>

    <table-column prop="performance" label="Performance" min-width="130" align="center" sortable>
      <template slot-scope="props">
        <div class="on-time-table__performance-progress" />
        <div class="on-time-table__performance-delayed" :style="{ left: percent(props.row.performance) }"/>
        <span class="on-time-table__performance-value">{{ percent(props.row.performance) }}</span>
      </template>
    </table-column>

    <table-column prop="total_count" label="Scheduled" min-width="90" />
    <table-column prop="flown_count" label="Flown" min-width="90" />
    <table-column prop="on_time_count" label="On-Time" min-width="100" />

    <table-column prop="delay_count" label="Delayed" min-width="100" />
    <table-column prop="canceled_count" label="Canceled" min-width="100" />

    <table-column label="Total Delay" min-width="130">
      <template slot-scope="props">
        {{ props.row.total_delay | timeDelta }}
      </template>
    </table-column>

    <table-column label="Average Delay" min-width="140">
      <template slot-scope="props">
        {{ props.row.avg_delay | timeDelta }}
      </template>
    </table-column>
  </table-el>
</template>

<style lang="scss" scoped>
  @import '../../../../scss/bs-variables';

  .on-time-table {
    &__performance-progress {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: lighten($blue, 47%);
    }

    &__performance-delayed {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      background-color: lighten($red, 27%);
    }

    &__performance-value {
      position: relative;
      z-index: 1;
    }
  }
</style>

