<script>
  import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
  import { find } from 'lodash';

  import SortableTable, { tableMixin } from 'Common/SortableTable';
  import { typeBasedSerializer } from 'Common/Filters/helpers';
  import { SET_FLIGHT } from 'store/modules/flights';
  import { TABLE_NAMESPACE, tableModule, SET_SELECTED_FLIGHT_IDS } from 'store/modules/dispatch/flight-list';
  import { SET_EDITABLE_FLIGHT, ERROR_STATUSES } from 'store/modules/dispatch/status-change';

  import { flag } from 'utils/permissions';
  import flightListApi from '../../../api/dispatch/flight-list';
  import DateTimeCell from './DateTimeCell.vue';
  import ChangeStatusPopover from './ChangeStatusPopover.vue';
  import ChangeAircraftTypeDialog from './ChangeAircraftTypeDialog.vue';
  import FlightTable from './Mixins/FlightTable';
  import BatchSelectableTable from './Mixins/BatchSelectableTable';

  export default {
    props: {
      flightsEditable: {
        type: Boolean,
        default: false,
      },
    },
    created() {
      this.getAvailableOfficialCodes();
      if (!this.aircraftTypes.length) {
        this.getAircraftTypes();
      }
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
      ChangeAircraftTypeDialog,
    },
    computed: {
      ...mapState('flights', ['flight']),
      ...mapState('dispatch/flight-list/filters', ['filters']),
      ...mapState('dispatch/flight-list/status-change', [
        'availableFlightStatuses',
        'availableOfficialCodes',
        'editableFlightId'
      ]),
      ...mapState('aircraft', ['aircraftTypes']),

      tableFilters() {
        return typeBasedSerializer(this.filters);
      },
      style() {
        return {
          marginBottom: this.flight ? '75vh' : 0,
        };
      },
      showFlightStatus() {
        return flag('show_status')(this.$store);
      },
    },
    methods: {
      ...mapMutations('flights', [SET_FLIGHT]),
      ...mapActions('flights', ['fetchFlightStatuses']),
      ...mapActions('dispatch/flight-list', ['removeFlight']),
      ...mapMutations('dispatch/flight-list', [SET_SELECTED_FLIGHT_IDS]),
      ...mapMutations('dispatch/flight-list/status-change', [SET_EDITABLE_FLIGHT]),
      ...mapActions('dispatch/flight-list/status-change', [
        'getAvailableOfficialCodes',
      ]),
      ...mapActions('pilotManifest/editFlight', {
        setEditFlightModalFlight: 'setFlight',
      }),
      ...mapActions('aircraft', ['getAircraftTypes']),

      showDetailView(flight) {
        this[SET_FLIGHT](flight);
        this.fetchFlightStatuses();
      },
      async showEditModal(flight) {
        /**
         * TODO: serialize normal way on the flight edit popup side
         */
        await this.setEditFlightModalFlight({
          ...flight,
          type_of_operations: flight.type_of_operations.name,
          operating_under: flight.operating_under.operation,
          origin: flight.origin.iata,
          destination: flight.destination.iata,
        });
      },
      async handleDeleteClick(flight) {
        await this.$confirm('Are you sure to delete this flight?', { confirmButtonText: 'Yes' });

        this.removeFlight(flight.id);
      },
      isEditPermitted(flight) {
        return this.flightsEditable && !flight.external;
      },
      isDeletePermitted(flight) {
        return this.flightsEditable && flight.removable;
      },
      handleStatusClick(flight) {
        this[SET_EDITABLE_FLIGHT](flight);
      },
      tableRowClassName({ row }) {
        if (row.id === this.editableFlightId) {
          return 'flight-list-table__row_editable';
        }
        return '';
      },
      handleSelectionChange(flights) {
        this[SET_SELECTED_FLIGHT_IDS](flights.map(flight => flight.id));
      },
      getAircraftTypeById(typeId) {
        if (!this.aircraftTypes.length || !typeId) return undefined;

        return find(this.aircraftTypes, { id: typeId }).name;
      },
    },
  };
</script>

<template>
  <div>
    <change-status-popover />
    <change-aircraft-type-dialog />

    <sortable-table
      ref="table"
      key="flight-list-table"
      :page-size="100"
      :filters="tableFilters"
      searchable="search"
      search-portal="flight-list-search"
      csv-portal="flight-list-csv"
      :namespace="TABLE_NAMESPACE"
      class="flight-list-table"
      :style="style"
      table-size="mini"
      @selection-change="handleSelectionChange"
      :row-class-name="tableRowClassName"
    >
      <el-table-column
        fixed="left"
        type="selection"
        width="55"
        v-if="flightsEditable" />

      <el-table-column
        fixed="left"
        prop="flight_number"
        sortable
        :width="flightsEditable ? 100 : 60"
        label="#">
        <template slot-scope="props">
          <div class="flight-list-table__flight-number-wrapper">
            <span
              class="flight-list-table__flight-number-btn"
              @click="showDetailView(props.row)">
            {{ props.row.flight_number }}<span v-if="props.row.copied">[c]</span>
          </span>

            <div class="flight-list-table__actions">
              <i v-if="isEditPermitted(props.row)" @click="showEditModal(props.row)"
                 class="fa fw fa-pencil flight-list-table__edit-btn" />
              <i v-if="isDeletePermitted(props.row)" @click="handleDeleteClick(props.row)"
                 class="fa fw fa-trash flight-list-table__delete-btn" />
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="status"
        sortable
        v-if="showFlightStatus"
        width="170px"
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
        prop="scheduled_aircraft_type"
        sortable
        width="120"
        label="Sch. Aircraft Type">
        <template slot-scope="props">
          {{ getAircraftTypeById(props.row.scheduled_aircraft_type) }}
        </template>
      </el-table-column>

      <el-table-column
        prop="scheduled_departure"
        sortable
        width="120"
        label="Sch. Dep. UTC">
        <template slot-scope="props">
          <date-time-cell :datetime="props.row.scheduled_departure" />
        </template>
      </el-table-column>

      <el-table-column
        prop="scheduled_arrival"
        sortable
        width="120"
        label="Sch. Arr. UTC">
        <template slot-scope="props">
          <date-time-cell :datetime="props.row.scheduled_arrival" />
        </template>
      </el-table-column>

      <el-table-column
        prop="type_of_operations.name"
        sortable="type_of_operations__name"
        label="Op. Type" />

      <el-table-column
        prop="operating_under.operation"
        sortable="operating_under__operation"
        label="Op. Under" />

      <!--<el-table-column-->
      <!--prop="#"-->
      <!--sortable-->
      <!--label="Operational Status" />-->

      <el-table-column
        prop="flightlog.manifest.tail_number"
        sortable="flightlog__manifest__aircraft__registration"
        label="Tail #" />

      <el-table-column
        prop="flightlog.manifest.pic_name"
        :show-overflow-tooltip="true"
        sortable="flightlog__manifest__pic_profile__id"
        min-width="130"
        label="PIC" />

      <el-table-column
        prop="flightlog.manifest.sic_name"
        :show-overflow-tooltip="true"
        sortable="flightlog__manifest__sic_profile__id"
        min-width="130"
        label="SIC" />

      <!--<el-table-column-->
      <!--prop="#"-->
      <!--sortable-->
      <!--label="Est OUT" />-->

      <!--<el-table-column-->
      <!--prop="#"-->
      <!--sortable-->
      <!--label="Est OFF" />-->

      <!--<el-table-column-->
      <!--prop="#"-->
      <!--sortable-->
      <!--label="Est ON" />-->

      <!--<el-table-column-->
      <!--prop="#"-->
      <!--sortable-->
      <!--label="Est IN" />-->

      <el-table-column
        prop="flightlog.actual_datetime_out"
        sortable="flightlog__actual_datetime_out"
        width="120"
        label="Act OUT">
        <template slot-scope="props">
          <date-time-cell :datetime="props.row.flightlog && props.row.flightlog.actual_datetime_out" />
        </template>
      </el-table-column>

      <el-table-column
        prop="flightlog.actual_datetime_off"
        sortable="flightlog__actual_datetime_off"
        width="120"
        label="Act OFF">
        <template slot-scope="props">
          <date-time-cell :datetime="props.row.flightlog && props.row.flightlog.actual_datetime_off" />
        </template>
      </el-table-column>

      <el-table-column
        prop="flightlog.actual_datetime_on"
        sortable="flightlog__actual_datetime_on"
        width="120"
        label="Act ON">
        <template slot-scope="props">
          <date-time-cell :datetime="props.row.flightlog && props.row.flightlog.actual_datetime_on" />
        </template>
      </el-table-column>

      <el-table-column
        prop="flightlog.actual_datetime_in"
        sortable="flightlog__actual_datetime_in"
        width="120"
        label="Act IN">
        <template slot-scope="props">
          <date-time-cell :datetime="props.row.flightlog && props.row.flightlog.actual_datetime_in" />
        </template>
      </el-table-column>
    </sortable-table>
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';
  @import "./flight-status";

  .el-table tr.flight-list-table__row_editable {
    background: #ddd;
  }

  .flight-list-table {
    &__flight-number-btn {
      cursor: pointer;
      line-height: 13px;
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
    &__edit-btn {
      margin-left: 2px;
      cursor: pointer;
      color: $blue;
      transition: .2s;
      &:hover {
        color: lighten($blue, 20%);
      }
    }
    &__delete-btn {
      margin-left: 2px;
      cursor: pointer;
      color: $red;
      transition: .2s;
      &:hover {
        color: lighten($red, 20%);
      }
    }

    &__flight-number-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    &__actions {

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

