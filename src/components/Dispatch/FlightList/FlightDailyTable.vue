<script>
  import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
  import { DateTime } from 'luxon';

  import SortableTable, { tableMixin } from 'Common/SortableTable';
  import { SET_FLIGHT } from 'store/modules/flights';
  import { TABLE_NAMESPACE, tableModule } from 'store/modules/dispatch/flight-list';
  import {
    SET_EDITABLE_FLIGHT,
    ERROR_STATUSES,
    SET_EDITABLE_FLIGHTS,
  } from 'store/modules/dispatch/status-change';

  import flightListApi from '../../../api/dispatch/flight-list';
  import FlightTable from './Mixins/FlightTable';
  import BatchSelectableTable from './Mixins/BatchSelectableTable';
  import DateTimeCell from './DateTimeCell.vue';
  import ChangeStatusPopover from './ChangeStatusPopover.vue';

  export default {
    created() {
      this.getAvailableOfficialCodes();
    },
    mixins: [FlightTable, BatchSelectableTable],
    data() {
      return {
        TABLE_NAMESPACE,
        ERROR_STATUSES,
      };
    },
    components: {
      SortableTable,
      DateTimeCell,
      ChangeStatusPopover,
    },
    computed: {
      ...mapState('flights', ['flight']),
      ...mapState('dispatch/flight-daily', ['date']),
      ...mapState('dispatch/flight-list/status-change', [
        'availableFlightStatuses',
        'availableOfficialCodes',
        'editableFlightId',
      ]),

      tableFilters() {
        const startDate = DateTime.fromISO(this.date, { zone: 'utc' })
          .startOf('day')
          .set({ hours: 9 });

        return {
          scheduled_departure_datetime_0: startDate.toISO(),
          scheduled_departure_datetime_1: startDate.plus({ days: 1 })
            .toISO(),
        };
      },
      style() {
        return {
          marginBottom: this.flight ? '75vh' : 0,
        };
      },
    },
    methods: {
      ...mapMutations('flights', [SET_FLIGHT]),
      ...mapActions('flights', ['fetchFlightStatuses']),
      ...mapMutations('dispatch/flight-list/status-change', [SET_EDITABLE_FLIGHT, SET_EDITABLE_FLIGHTS]),
      ...mapActions('dispatch/flight-list/status-change', [
        'getAvailableOfficialCodes',
      ]),
      showDetailView(flight) {
        this[SET_FLIGHT](flight);
        this.fetchFlightStatuses();
      },
      handleStatusClick(flight) {
        this[SET_EDITABLE_FLIGHT](flight);
      },
      handleSelectionChange(values) {
        this[SET_EDITABLE_FLIGHTS](values);
      },
      tableRowClassName({ row }) {
        if (row.id === this.editableFlightId) {
          return 'flight-list-table__row_editable';
        }
        return '';
      },
    },
  };
</script>

<template>
  <div>
    <change-status-popover />

    <sortable-table
      key="flight-daily-table"
      ref="table"
      :page-size="200"
      :filters="tableFilters"
      searchable="search"
      search-portal="flight-daily-search"
      :namespace="TABLE_NAMESPACE"
      class="flight-list-table"
      :style="style"
      :row-class-name="tableRowClassName"
      table-size="mini"
      @selection-change="handleSelectionChange"
      :default-sort="{ prop: 'scheduled_departure', order: 'ascending' }"
    >
      <el-table-column
        fixed="left"
        type="selection"
        width="55" />

      <el-table-column
        fixed="left"
        prop="flight_number"
        sortable
        label="#">
        <template slot-scope="props">
          <span
            class="flight-list-table__flight-number-btn"
            @click="showDetailView(props.row)">
              {{ props.row.flight_number }} <span v-if="props.row.copied">[c]</span>
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="status"
        sortable
        width="170"
        label="Status">
        <template slot-scope="props">
          <el-button-group>
            <el-button
              @click.stop="handleStatusClick(props.row)"
              :class="getStatusBtnClass(props.row.status)"
              size="mini"
              :type="getStatusBtnType(props.row)">
              {{ getStatusBtnTitle(props.row) }}
            </el-button>
            <el-button
              v-if="props.row.is_delayed && props.row.status != 4"
              @click.stop="handleStatusClick(props.row)"
              class="flight-list-table__status-btn flight-list-table__status-btn_delayed"
              type="primary"
              size="mini">
              Delayed <span v-if="props.row.official_code">{{ getOfficialCode(props.row) }}</span>
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>


      <el-table-column
        prop="origin.iata"
        sortable="origin__iata"
        label="Origin">
        <template slot-scope="props">
          <span :style="{'text-decoration': props.row.actual_origin  ? 'line-through' : 'none'}"
                v-if="!props.row.actual_origin || props.row.actual_origin.id != props.row.origin.id">
            {{ props.row.origin.iata }}
          </span>
          <span v-if="props.row.actual_origin">
            {{ props.row.actual_origin.iata }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="destination.iata"
        sortable="destination__iata"
        label="Dest.">
        <template slot-scope="props">
          <span :style="{'text-decoration': props.row.actual_destination  ? 'line-through' : 'none'}"
                v-if="!props.row.actual_destination || props.row.actual_destination.id != props.row.destination.id">
            {{ props.row.destination.iata }}
          </span>
          <span v-if="props.row.actual_destination">
            {{ props.row.actual_destination.iata }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="scheduled_departure"
        sortable
        width="120"
        label="Scheduled Departure">
        <template slot-scope="props">
          <date-time-cell :datetime="props.row.scheduled_departure" />
        </template>
      </el-table-column>

      <el-table-column
        prop="estimated_departure"
        width="120"
        sortable="estimated_departure"
        label="Estimated OUT">
        <template slot-scope="props">
          <date-time-cell :datetime="props.row.estimated_departure" />
        </template>
      </el-table-column>

      <el-table-column
        prop="flightlog.actual_datetime_out"
        width="125"
        sortable="flightlog__actual_datetime_out"
        label="Actual OUT">
        <template slot-scope="props">
          <date-time-cell :datetime="props.row.flightlog && props.row.flightlog.actual_datetime_out" />
        </template>
      </el-table-column>

      <el-table-column
        prop="estimated_arrival"
        width="125"
        sortable="estimated_arrival"
        label="Estimated IN">
        <template slot-scope="props">
          <date-time-cell :datetime="props.row.estimated_arrival" />
        </template>
      </el-table-column>

      <el-table-column
        prop="flightlog.actual_datetime_in"
        width="125"
        sortable="flightlog__actual_datetime_in"
        label="Actual IN">
        <template slot-scope="props">
          <date-time-cell :datetime="props.row.flightlog && props.row.flightlog.actual_datetime_in" />
        </template>
      </el-table-column>

      <el-table-column
        prop="scheduled_arrival"
        width="125"
        sortable
        label="Scheduled Arrival">
        <template slot-scope="props">
          <date-time-cell :datetime="props.row.scheduled_arrival" />
        </template>
      </el-table-column>

      <el-table-column
        prop="flightlog.manifest.aircraft_name"
        sortable="flightlog__manifest__aircraft__registration"
        label="Tail #" />

      <el-table-column
        prop="flightlog.manifest.pic_name"
        :show-overflow-tooltip="true"
        sortable="flightlog__manifest__pic_profile__id"
        min-width="130"
        label="Actual PIC" />

      <el-table-column
        prop="flightlog.manifest.sic_name"
        :show-overflow-tooltip="true"
        sortable="flightlog__manifest__sic_profile__id"
        width="120"
        label="Actual SIC" />
    </sortable-table>
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .el-table tr.flight-list-table__row_editable {
    background: #ddd !important;
  }

  .flight-list-table {
    &__flight-number-btn {
      cursor: pointer;
      color: $blue;
      border-bottom: 1px dotted lighten($blue, 30%);
      transition: .2s;
      &:hover {
        color: lighten($blue, 20%);
      }
    }
    &__status-btn {
      font-size: 11px;
      padding: 2px 4px;
    }
  }

  .flight-list-table {
    .el-table td {
      padding: 0;
      font-size: 11px;
    }
    .el-table__header {
      th {
        padding: 0;
        font-size: 11px;
      }
    }
  }
</style>

