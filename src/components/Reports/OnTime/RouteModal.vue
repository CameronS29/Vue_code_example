<script>
  import { find, get, omit } from 'lodash';
  import { DateTime } from 'luxon';
  import differenceInSeconds from 'date-fns/differenceInSeconds';
  import differenceInMinutes from 'date-fns/differenceInMinutes';
  import toDate from 'date-fns/toDate';
  import isValid from 'date-fns/isValid';

  import { TableColumn } from 'element-ui';
  import Modal from '../../Common/Modal.vue';
  import Card from '../../Common/Card.vue';
  import SortableTable from '../../Common/SortableTable';

  import { formatTime, formatDateTime, timeZones } from '../utils';
  import { queryParam } from '../../../utils/routers';

  const statusMap = {
    1: 'En Route',
    2: 'Landed',
    3: 'Canceled',
    4: 'Delayed',
    5: 'On Time',
  };

  const getDateFromString = (date, zone) => {
    const dt = DateTime.fromISO(date, { zone });
    return (dt.isValid
      ? dt
      : DateTime.fromFormat(date, 'MM/dd/yyyy', { zone }));
  };

  export default {
    name: 'RouteModal',

    props: {
      filters: {
        type: Object,
        default: () => ({}),
      },
      origin: String,
      destination: String,
    },

    components: {
      Modal,
      Card,
      SortableTable,
      TableColumn,
    },

    computed: {
      tableFilters() {
        const {
          origin, destination, tzOffset,
          filters: { date_from, date_to },
        } = this;

        return {
          date_from: getDateFromString(date_from, tzOffset).toISO(),
          date_to: getDateFromString(date_to, tzOffset).toISO(),
          origin,
          destination,
        };
      },

      modalTitle() {
        return `Flight Logs for ${this.origin} / ${this.destination}`;
      },

      tzList() {
        return timeZones;
      },

      timeZone: queryParam({
        param: 'display',
        defaultValue: 'UTC',
      }),

      tzOffset() {
        return get(find(timeZones, ['name', this.timeZone]), 'offset', 'utc');
      },
    },

    methods: {
      diff({ scheduled_arrival, actual_datetime_in }) {
        return differenceInMinutes(
          toDate(actual_datetime_in),
          toDate(scheduled_arrival),
        );
      },

      closeModal() {
        this.$router.push({
          name: 'report_ontime',
          query: omit(this.$route.query, 'display'),
        });
      },

      formatType({ status, delay }) {
        const statusText = statusMap[status] || 'Unknown';
        return delay ? `${statusText} (${delay})` : statusText;
      },

      rowClassName({ row }) {
        switch (row.status) {
          case 3: return 'on-time-route-modal__row_cancelled';
          default: return '';
        }
      },
    },

    filters: {
      date: formatDateTime,

      delay({ scheduled_arrival, actual_datetime_in, estimated_arrival }) {
        const arrival = toDate(actual_datetime_in || estimated_arrival);
        if (!isValid(arrival)) {
          return '-//-';
        }
        const difference = differenceInSeconds(arrival, toDate(scheduled_arrival));
        return formatTime(difference);
      },

      manifestLink({ manifest_id }) {
        return `/flightlog/manifest/${manifest_id}/view/`;
      },
    },
  };
</script>

<template>
  <modal :show="true" @close="closeModal" transparent>
    <card keep-alive class="on-time-route-modal__container" :title="modalTitle">
      <h4 class="on-time-route-modal__subtitle">
        All dates are shown in
        <select class="form-control on-time-route-modal__tz-select" v-model="timeZone">
          <option v-for="tz in tzList" :key="tz.name" :value="tz.name">
            {{ tz.name }}
          </option>
        </select>
      </h4>

      <sortable-table namespace="reports/onTime/route" :filters="tableFilters" :row-class-name="rowClassName">
        <table-column min-width="110" label="Flight #" sortable="flight__flight_number">
          <template slot-scope="props">
            <a v-if="props.row.flightlog"
               :href="props.row.absolute_url"
               target="_blank"
               title="Open Flight Log in new Tab">
              {{ props.row.flight_number }}
            </a>
            <span v-else>
              {{ props.row.flight_number }}
            </span>
          </template>
        </table-column>

        <table-column min-width="135" label="Manifest #" sortable="manifest__number">
          <template slot-scope="props">
            <a v-if="props.row.manifest_id"
               :href="props.row | manifestLink"
               target="_blank"
               title="Open Flight Manifest in new Tab">
              {{ props.row.manifest_number }}
            </a>
            <span v-else>-//-</span>
          </template>
        </table-column>

        <table-column min-width="120" label="Delay" sortable="arrival_delta">
          <template slot-scope="props">
            <div v-if="Math.abs(diff(props.row)) >= 15"
                 :class="{
                   'on-time-route-modal__abnormal': true,
                   'on-time-route-modal__delayed': (diff(props.row) >= 15),
                   'on-time-route-modal__earlybird': (diff(props.row) <= -15),
            }" />
            <span class="on-time-route-modal__delay">{{ props.row | delay }}</span>
          </template>
        </table-column>

        <table-column min-width="140" prop="delay" label="Type" :formatter="formatType" />
        <table-column min-width="180" prop="reporting_profile" label="Reporter" />

        <table-column
          min-width="210"
          label="Scheduled Departure"
          sortable="flight__scheduled_departure"
        >
          <template slot-scope="props">
            {{ props.row.scheduled_departure | date(tzOffset) }}
          </template>
        </table-column>

        <table-column
          min-width="190"
          label="Scheduled Arrival"
          sortable="flight__scheduled_arrival"
        >
          <template slot-scope="props">
            {{ props.row.scheduled_arrival | date(tzOffset) }}
          </template>
        </table-column>

        <table-column
          min-width="180"
          label="Actual Time OUT"
          sortable="actual_datetime_out"
        >
          <template slot-scope="props">
            {{ props.row.actual_datetime_out | date(tzOffset) }}
          </template>
        </table-column>

        <table-column
          min-width="180"
          label="Actual Time IN"
          sortable="actual_datetime_in"
        >
          <template slot-scope="props">
            {{ props.row.actual_datetime_in | date(tzOffset) }}
          </template>
        </table-column>

        <table-column min-width="180" label="Estimated Departure">
          <template slot-scope="props">
            {{ props.row.estimated_departure | date(tzOffset) }}
          </template>
        </table-column>

        <table-column min-width="180" label="Estimated Arrival">
          <template slot-scope="props">
            {{ props.row.estimated_arrival | date(tzOffset) }}
          </template>
        </table-column>
      </sortable-table>
    </card>
  </modal>
</template>

<style lang="scss">
  @import "../../../../scss/bs-variables";

  .on-time-route-modal {
    &__container {
      width: 75vw;
    }

    &__subtitle {
      font-weight: 400;
      color: lighten(black, 40%);
      margin-top: -10px;
      margin-bottom: 15px;
    }

    &__tz-select {
      display: inline-block;
      width: auto;
    }

    &__abnormal {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    &__delayed {
      background-color: lighten($red, 30%);
    }

    &__earlybird {
      background-color: lighten($yellow, 30%);
    }

    &__delay {
      position: relative;
      z-index: 1;
    }

    &__row {
      .el-table &_cancelled {
        background: lighten(mix($red, $blue, 60%), 35%);
      }
    }
  }
</style>
