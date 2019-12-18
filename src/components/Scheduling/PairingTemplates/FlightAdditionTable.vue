<script>
  import { mapGetters, mapActions } from 'vuex';
  import { DateTime } from 'luxon';
  import { pickBy, sortBy } from 'lodash';

  import SortableTable from 'Common/SortableTable';
  import ButtonEl from 'Common/Button.vue';
  import { isValidPairing, transformToDateFree, sortByDeparture } from '../../../utils/flights';

  export const tableNamespace = 'scheduling/flightAddition';
  const INFINITE_TABLE_LIMIT = 9999; // sorry, but without this explicit stuff it applies default one

  export default {
    props: {
      selectedFlights: {
        type: Object,
        default: () => ({}),
      },

      selectedNextDayFlights: {
        type: Object,
        default: () => ({}),
      },

      filterByFlights: {
        type: Array,
        default: () => ([]),
      },

      startDate: {
        type: String,
        default: null,
      },

      endDate: {
        type: String,
        default: null,
      },

      onlyScheduled: {
        type: Boolean,
        default: true,
      },

      revision: {
        type: [Boolean, Number],
        default: false,
      },

      shift: {
        type: [Boolean, Object],
        default: false,
      },

      clientFilter: {
        type: [Boolean, Function],
        default: false,
      },
    },

    components: {
      SortableTable,
      ButtonEl,
    },

    created() {
      this.getAllAvailableAirports();
    },

    computed: {
      ...mapGetters('airports', ['airports']),
      ...mapGetters(tableNamespace, ['results']),

      filters() {
        return pickBy({
          revision: this.revision,
          scheduled: this.onlyScheduled,
          base: this.baseAirportIATAs,
          start_date: this.startDate,
          end_date: this.endDate,
        });
      },
    },

    methods: {
      ...mapActions('airports', ['getAllAvailableAirports']),

      handleAddFlightClick(flight) {
        this.$emit('select-flight', flight);
      },

      handleRemoveFlightClick(flight) {
        this.$emit('remove-flight', flight);
      },

      handleNextDayAddFlightClick(flight) {
        this.$emit('select-next-day-flight', flight);
      },

      handleNextDayRemoveFlightClick(flight) {
        this.$emit('remove-next-day-flight', flight);
      },

      isFlightAlreadyApplied(flight) {
        return (this.revision
          ? this.selectedFlights[flight.id]
          : this.selectedFlights[flight.flight_number]) !== undefined;
      },

      isNextDayFlightAlreadyApplied(flightNumber) {
        return this.selectedNextDayFlights[flightNumber] !== undefined;
      },

      handleBaseAirportChange(iatas) {
        this.baseAirportIATAs = iatas;
      },

      tableClientFilter(row) {
        if (this.filterByFlights.length) {
          const builtInFilter = this.revision
            ? this.revisionedRowFilter(row)
            : this.unrevisionedRowFilter(row);

          if (!builtInFilter) return false;
        }

        if (this.flightNumber.length
          && row.flight_number.indexOf(this.flightNumber) !== 0) return false;

        if (this.clientFilter) return this.clientFilter(row);

        return true;
      },

      revisionedRowFilter(row) {
        const expectedShift = sortBy(
          [...this.filterByFlights, row],
          flight => DateTime.fromISO(flight.scheduled_departure),
        );

        return isValidPairing(expectedShift);
      },

      unrevisionedRowFilter(row) {
        return this.showPlusBtn(row) || this.showPlusOneBtn(row);
      },

      showPlusBtn(row) {
        if (this.revision) return true;

        const expectedShift = sortByDeparture([
          ...this.filterByFlights,
          transformToDateFree(row),
        ]);

        return isValidPairing(expectedShift);
      },

      showPlusOneBtn(row) {
        if (this.revision) return false;

        const expectedShift = sortByDeparture([
          ...this.filterByFlights,
          transformToDateFree(row, 1),
        ]);

        return isValidPairing(expectedShift);
      },

      additionBtnType(row) {
        if (row.pairs && row.pairs.length && (row.pairs[0] !== this.shift.id)) return 'warning';

        return 'primary';
      },

      additionBtnTitle(row) {
        if (row.pairs && row.pairs.length && (row.pairs[0] !== this.shift.id)) {
          return 'Flight already applied to another shift!';
        }

        return 'Add';
      },
    },

    data() {
      return {
        INFINITE_TABLE_LIMIT,
        tableNamespace,
        baseAirportIATAs: [],
        flightNumber: '',
        filterByFlightsKey: 'nonFiltered',
        rowPropsCache: {},
      };
    },

    filters: {
      formatTime(time) {
        return `${time.substr(11, 5)}Z`;
      },
    },

    watch: {
      filterByFlights() {
        this.filterByFlightsKey = this.filterByFlights.length
        ? this.filterByFlights.map(flight => flight.id).sort().join('')
        : 'nonFiltered';
      },
    },
  };
</script>

<template>
  <div>
    <div class="flights-table__filters">

      <el-select
        :value="baseAirportIATAs"
        @input="handleBaseAirportChange"
        filterable
        multiple
        placeholder="Filter Bases"
      >
        <el-option
          v-for="airport in airports"
          :key="airport.id"
          :label="airport.iata"
          :value="airport.iata"/>
      </el-select>

      <el-input
        placeholder="Flight number"
        v-model="flightNumber"/>

    </div>

    <sortable-table
      :namespace="tableNamespace"
      :filters="filters"
      :isBordered="false"
      :page-size="INFINITE_TABLE_LIMIT"
      :show-pagination="false"
      :client-filter="tableClientFilter"
      queryPrefix="fa-"
      searchable="flight_number"
      searchPortal="flights-search-input"
      class="flights-table__flight-list"
    >
      <el-table-column prop="flight_number" width="72" label="#" />

      <el-table-column label="Origin → Dest">
        <template slot-scope="scope">
          <span class="flights-table__tag">{{ scope.row.origin }}</span>
          <span class="→">→</span>
          <span class="flights-table__tag">{{ scope.row.destination }}</span>
        </template>
      </el-table-column>

      <el-table-column label="Departure/Arrival">
        <template slot-scope="scope">
          {{scope.row.scheduled_departure | formatTime}}
          <span class="→">→</span>
          {{scope.row.scheduled_arrival | formatTime}}
        </template>
      </el-table-column>

      <el-table-column :width="revision ? 56 : 106">
        <template
          slot-scope="scope">
          <div class="flights-table__btns">
            <span
              v-if="showPlusBtn(scope.row)">
              <button-el
                type="danger"
                size="sm"
                title="Edit"
                icon="trash-o"
                @click="handleRemoveFlightClick(scope.row)"
                v-if="isFlightAlreadyApplied(scope.row)"
              />
              <button-el
                :type="additionBtnType(scope.row)"
                size="sm"
                :title="additionBtnTitle(scope.row)"
                icon="plus"
                @click="handleAddFlightClick(scope.row)"
                v-else
              />
            </span>

            <span
              v-if="showPlusOneBtn(scope.row)">
              <button-el
                type="danger"
                size="sm"
                title="Edit"
                icon="trash-o"
                @click="handleNextDayRemoveFlightClick(scope.row)"
                v-if="isNextDayFlightAlreadyApplied(scope.row.flight_number)"
              >1</button-el>
              <button-el
                :type="additionBtnType(scope.row)"
                size="sm"
                :title="additionBtnTitle(scope.row)"
                icon="plus"
                @click="handleNextDayAddFlightClick(scope.row)"
                v-else
              >1</button-el>
            </span>
          </div>
        </template>
      </el-table-column>
    </sortable-table>
  </div>
</template>

<style lang="scss" scoped>
  @import '../../../../scss/bs-variables';

  .flights-table {
    &__tag {
      background-color: rgba(26, 179, 148, 0.1);
      display: inline-block;
      font-size: 12px;
      border-radius: 4px;
      box-sizing: border-box;
      border: 1px solid transparent;
      white-space: nowrap;
      background-color: #e4f0f1;
      color: #486a68;
      height: 24px;
      padding: 0 8px;
      line-height: 22px;
    }
    &__filters {
      padding: 8px 18px;
      display: flex;
      justify-content: space-between;

      .el-select, .el-input {
        flex: 0 0 calc(50% - 5px);
      }
    }
    &__btns {
      text-align: right;
    }
  }

  .→ {
    @media screen and (max-width: $screen-xs-max) {
      display: none;
    }
  }
</style>
