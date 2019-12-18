<script>
  import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
  import { find } from 'lodash';

  import SortableTable, { tableMixin } from 'Common/SortableTable';
  import { typeBasedSerializer } from 'Common/Filters/helpers';
  import { SET_FLIGHT } from 'store/modules/flights';
  import { TABLE_NAMESPACE, tableModule } from 'store/modules/dispatch/flight-list';

  import flightListApi from '../../../api/dispatch/flight-list';
  import DateTimeCell from '../../Dispatch/FlightList/DateTimeCell.vue';

  export default {
    mixins: [tableMixin(TABLE_NAMESPACE, flightListApi, tableModule)],
    data() {
      return {
        TABLE_NAMESPACE,
      };
    },
    props: {
      selectedFlights: {
        type: Array,
        default: () => [],
      },
    },
    components: {
      SortableTable,
      DateTimeCell,
    },
    computed: {
      ...mapState('flights', ['flight']),
      ...mapState('dispatch/flight-list/filters', ['filters']),

      tableFilters() {
        return typeBasedSerializer(this.filters);
      },

      tableHeight() {
        return window.innerHeight - (this.selectedFlights.length ? 400 : 350);
      },
    },
    methods: {
      ...mapMutations('flights', [SET_FLIGHT]),
      ...mapActions('flights', ['fetchFlightStatuses']),

      showDetailView(flight) {
        this[SET_FLIGHT](flight);
        this.fetchFlightStatuses();
      },

      isSelected(flight) {
        return !!find(this.selectedFlights, selectedFlight => selectedFlight.id === flight.id);
      },

      handleSelect(flight) {
        this.$emit(this.isSelected(flight) ? 'remove-selection' : 'add-selection', flight);
      },
    },
  };
</script>

<template>
  <div>
    <sortable-table
      :page-size="50"
      :max-height="tableHeight"
      :filters="tableFilters"
      searchable="search"
      search-portal="discrepancy-list-search"
      :namespace="TABLE_NAMESPACE"
      class="flight-picker-table"
      table-size="mini"
    >
      <el-table-column
        fixed="left"
        width="55">
        <template slot-scope="props">
          <el-checkbox :value="isSelected(props.row)" @input="handleSelect(props.row)" />
        </template>
        <el-checkbox />
      </el-table-column>

      <el-table-column
        fixed="left"
        prop="flight_number"
        sortable
        width="60px"
        label="#">
        <template slot-scope="props">
          <span
            class="flight-picker-table__flight-number-btn"
            @click="showDetailView(props.row)">{{ props.row.flight_number }}</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="origin.iata"
        sortable="origin__iata"
        label="Origin" />

      <el-table-column
        prop="destination.iata"
        sortable="destination__iata"
        label="Dest." />

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

  .el-table tr.flight-picker-table__row_editable {
    background: #ddd;
  }

  .flight-picker-table {
    &__flight-number-btn {
      cursor: pointer;
      color: $blue;
      border-bottom: 1px dotted lighten($blue, 30%);
      transition: .2s;
    }
  }

  .flight-picker-table {
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

