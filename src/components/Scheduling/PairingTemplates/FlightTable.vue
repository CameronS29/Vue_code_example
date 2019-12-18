<script>
  import { mapGetters, mapMutations, mapState } from 'vuex';
  import { DateTime } from 'luxon';
  import FixedOffsetZone from 'luxon/src/zones/fixedOffsetZone';
  import { includes, map } from 'lodash';

  import ButtonEl from 'Common/Button.vue';
  import PairBadge from '../Common/PairBadge.vue';
  import {
    getInvalidFlights,
    isValidPairing,
    sortByDeparture,
  } from '../../../utils/flights';
  import * as consts from '../../../store/modules/scheduling/consts';

  export default {
    props: {
      editableMode: {
        type: Boolean,
        default: false,
      },

      filterByFlights: {
        type: Array,
        default: () => ([]),
      },

      data: {
        type: Array,
        default: () => ([]),
      },

      shift: {
        type: [Boolean, Object],
        default: false,
      },

      showSplit: {
        type: Boolean,
        default: false,
      },
    },

    computed: {
      ...mapState('scheduling/pairings', ['conflictFlight', 'pairingSplit']),
      ...mapGetters('scheduling/pairings', ['splitFlights']),
      ...mapGetters('scheduling/revisions', ['activePublished']),

      sortedData() {
        if (!this.shift) {
          return this.data;
        }
        return sortByDeparture(this.data);
      },

      formattedData() {
        const invalidFlights = getInvalidFlights(this.sortedData);

        return this.sortedData.map(flight => ({
          ...flight,
          isInvalid: includes(invalidFlights, flight),
        }));
      },

      isValid() {
        return isValidPairing(this.sortedData);
      },

      splitShifts() {
        return map(this.splitFlights, (flights, idx) => ({
          flights,
          name: idx === 0 ? this.shift.name : `${this.shift.name}-${idx}`,
        }));
      },

      tz() {
        return FixedOffsetZone.utcInstance;
      },
    },

    components: {
      ButtonEl,
      PairBadge,
    },

    methods: {
      ...mapMutations('scheduling/pairings', [
        consts.ADD_PAIRING_SPLIT,
        consts.REMOVE_PAIRING_SPLIT,
      ]),

      handleRemoveFlightClick(flight) {
        this.$emit('remove-flight', flight);
      },
      handleRemoveFlightFromFiltersClick(flight) {
        this.$emit('remove-from-filters', flight);
      },
      handleAddFlightToFiltersClick(flight) {
        this.$emit('add-to-filters', flight);
      },
      isFilteredBy(flight) {
        return this.filterByFlights.map(flight => flight.id).indexOf(flight.id) !== -1;
      },
      showPlusOneMark(flight) {
        if (this.shift) {
          const flightDate = DateTime.fromISO(flight.scheduled_departure, { zone: 'UTC' });
          const shiftDate = DateTime.fromFormat(this.shift.date, consts.LUXON_US_DATE_FORMAT, { zone: 'UTC' });
          return !flightDate.hasSame(shiftDate, 'day');
        }
        return flight.isNextDayFlight;
      },

      tableRowClassName({ row, rowIndex }) {
        const classes = [];
        if (this.conflictFlight && (row.id === this.conflictFlight.id)) {
          classes.push('templates-flight-table__conflicted-flight');
        }
        if (this.isInSplit(rowIndex)) {
          classes.push('templates-flight-table__active-split');
        }
        return classes.join(' ');
      },

      handleAddPairingSplit({ $index }) {
        if (this.isInSplit($index)) {
          this[consts.REMOVE_PAIRING_SPLIT]($index);
        } else {
          this[consts.ADD_PAIRING_SPLIT]($index);
        }
      },

      isInSplit(idx) {
        return this.pairingSplit.indexOf(idx) !== -1;
      },
    },

    filters: {
      formatTime(time) {
        return `${DateTime.fromISO(time).toUTC().toLocaleString(DateTime.TIME_24_SIMPLE)}Z`;
      },
    },
  };
</script>

<template>
  <div class="shift-template-tables">
    <el-alert
      title="Shift is not valid"
      type="error"
      description="It will be saved only after validation proceed"
      v-if="!isValid"
      :closable="false"
      show-icon
    />
    <el-alert
      :title="`Flight ${this.conflictFlight.flight_number} already included in this shift`"
      type="warning"
      description="Please remove it first, to continue scheduling"
      v-if="this.conflictFlight"
      show-icon
    />
    <el-table :data="formattedData" class="templates-flight-table" :row-class-name="tableRowClassName">
      <el-table-column prop="flight_number" width="72" label="#">
        <template slot-scope="scope">
          <el-badge :title="scope.row.isInvalid && 'This flight is not valid related to previous one'"
                    class="templates-flight-table__invalid-badge"
                    is-dot
                    :hidden="!scope.row.isInvalid"
                    value="!">
            {{ scope.row.flight_number }}
          </el-badge>
        </template>
      </el-table-column>

      <el-table-column label="Origin → Dest">
        <template slot-scope="scope">
          <el-tag :disable-transitions="true" type="info" size="small">{{ scope.row.origin }}</el-tag>
          →
          <el-tag :disable-transitions="true" type="info" size="small">{{ scope.row.destination }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="Departure/Arrival">
        <template slot-scope="scope">
          {{ scope.row.scheduled_departure | formatTime }}
          →
          {{ scope.row.scheduled_arrival | formatTime }}
          <span class="templates-flight-table__next-day-notify"
                v-if="showPlusOneMark(scope.row)">+1 day</span>
        </template>
      </el-table-column>

      <el-table-column width="98" v-if="editableMode">
        <template slot-scope="scope">
          <div class="templates-flight-table__btns" v-if="!shift || !activePublished">
            <button-el v-if="isFilteredBy(scope.row)"
                       size="xs"
                       icon="times"
                       title="Remove from filters"
                       @click="handleRemoveFlightFromFiltersClick(scope.row)" />

            <button-el v-else
                       size="xs"
                       icon="filter"
                       title="Add to filters"
                       @click="handleAddFlightToFiltersClick(scope.row)" />

            <button-el size="sm"
                       type="danger"
                       icon="trash"
                       title="Remove"
                       @click="handleRemoveFlightClick(scope.row)" />

            <el-button
              v-if="showSplit && scope.$index < (formattedData.length - 1)"
              class="templates-flight-table__split-button"
              :class="{ 'templates-flight-table__split-button_active': isInSplit(scope.$index) }"
              size="mini"
              type="danger"
              round
              plain
              icon="fa fa-scissors fa-rotate-180"
              title="Split shift here"
              @click="handleAddPairingSplit(scope)"
            />
          </div>
        </template>
      </el-table-column>

      <div slot="append" class="templates-flight-table__split-list" v-if="pairingSplit.length > 0">
        <div class="templates-flight-table__split-pairs">
          <pair-badge v-for="shift in splitShifts" :key="shift.name" :pair="shift" :timezone="tz" />
        </div>
        <el-button type="primary" size="mini" @click="$emit('split-pair')">Apply Split</el-button>
      </div>
    </el-table>
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .templates-flight-table {
    &__invalid-badge {
      margin: 4px 0;
    }

    &__conflicted-flight {
      background-color: transparentize($yellow, .9) !important;
    }

    &__next-day-notify {
      color: $red;
      margin-left: 5px;
    }

    &__btns {
      display: flex;
      justify-content: flex-end;
      .btn {
        margin-left: 5px;
      }
    }

    &__split-button {
      position: absolute;
      right: -11px;
      bottom: -10px;
      z-index: 1;

      opacity: 0;
      transition: opacity .15s linear;

      tr:hover & {
        opacity: 1;
      }

      &_active.el-button--danger.is-plain {
        color: $red;
        opacity: 1;
        background: lighten($red, 32%);
        border-color: $red;
      }

      &.el-button--mini.is-round {
        padding: 3px;
      }
    }

    &__split-list {
      background: $--table-footer-background;
      padding: 15px 15px;
    }

    &__split-pairs {
      display: flex;
      flex-flow: row wrap;
      font-size: 0.8em;
      margin-bottom: 10px;
    }

    &.el-table {
      td {
        transition: border-bottom-color .15s linear;
      }

      .templates-flight-table__active-split td {
        border-bottom-color: $red;
      }

      &, .el-table__body-wrapper, .cell {
        overflow: visible;
      }
    }
  }
</style>
