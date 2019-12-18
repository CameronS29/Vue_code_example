<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { DateTime } from 'luxon';
  import BottomPopper from 'Common/BottomPopper.vue';

  import FlightBadge from '../Common/FlightBadge.vue';
  import PairBadgeGroup from '../Common/PairBadgeGroup.vue';
  import timezones from '../../FDT/utils/timezones';
  import * as consts from '../../../store/modules/scheduling/consts';

  export default {
    components: {
      BottomPopper,
      FlightBadge,
      PairBadgeGroup,
    },

    data() {
      return {
        timezones,
        activeName: null,
      };
    },

    computed: {
      ...mapState('scheduling/calendar', ['showAssignedFlightsDate']),
      ...mapState('scheduling/calendar/filters', ['actual', 'baseAirportIds']),
      ...mapState('scheduling/assignedFlights', ['assignedFlights', 'assignedPairs', 'timezone']),
      ...mapGetters('scheduling/assignedFlights', ['isLoading', 'flightCount', 'pairCount', 'baseGroupedPairs']),
      ...mapState('scheduling/pairingTemplates/holidays', ['holidays']),

      header() {
        return DateTime.fromISO(this.showAssignedFlightsDate).toLocaleString(DateTime.DATE_HUGE);
      },

      holiday() {
        const index = this.holidays.map(holiday => holiday.date)
          .indexOf(DateTime.fromISO(this.showAssignedFlightsDate)
            .toFormat(consts.LUXON_US_DATE_FORMAT));

        return index > -1 ? this.holidays[index] : undefined;
      },

      _timezone: {
        get() {
          return this.timezone;
        },
        set(timezone) {
          this[consts.SET_TIMEZONE](timezone);
          this.getAssignedFlights(this.showAssignedFlightsDate);
          this.getAssignedPairs(this.showAssignedFlightsDate);
        },
      },

      showPopper() {
        return this.showAssignedFlightsDate !== null;
      },
    },

    methods: {
      ...mapMutations('scheduling/calendar', [consts.SET_SHOW_ASSIGNED_FLIGHTS_DATE]),
      ...mapMutations('scheduling/assignedFlights', [consts.SET_TIMEZONE]),
      ...mapActions('scheduling/assignedFlights', ['getAssignedFlights', 'getAssignedPairs']),

      handleCloseClick() {
        this[consts.SET_SHOW_ASSIGNED_FLIGHTS_DATE](null);
      },

      hasFlights(flightType) {
        const flightGroup = this.assignedFlights[flightType];
        return flightGroup !== undefined && flightGroup.length;
      },

      hasPairs(flightType) {
        const pairGroup = this.assignedPairs[flightType];
        return pairGroup !== undefined && pairGroup.length;
      },

      updateAssignment() {
        if (this.showPopper) {
          this.getAssignedFlights(this.showAssignedFlightsDate);
          this.getAssignedPairs(this.showAssignedFlightsDate);
        }
      },

      isInSelectedBases(iata) {
        return this.baseAirportIds.indexOf(iata) > -1;
      },
    },

    watch: {
      actual: 'updateAssignment',
    },
  };
</script>

<template>
  <bottom-popper class="assigned-flight-list" :show="showPopper" @close="handleCloseClick">
    <header slot="header" class="assigned-flight-list__header">
      {{ header }}
      <el-select v-model="_timezone" class="assigned-flight-list__timezone-picker">
        <el-option
          v-for="timezone in timezones"
          :key="timezone[0]"
          :label="timezone[0]"
          :value="timezone[1]">
        </el-option>
      </el-select>

      <div
        v-if="holiday"
        class="assigned-flight-list__holiday-label">
        {{ holiday.name }}
      </div>
    </header>

    <el-tabs v-model="activeName" class="assigned-flight-list__tabs">
      <el-tab-pane v-if="pairCount" :label="`Pairs (${pairCount})`">
        <div class="assigned-flight-list__flight-groups" v-loading="isLoading">
          <div class="assigned-flight-list__flight-group" v-if="hasPairs('unassigned')">
            <h5 class="assigned-flight-list__group-heading">Unassigned Pairs</h5>
            <div class="assigned-flight-list__badge-groups">
              <pair-badge-group
                v-for="(group, key) in baseGroupedPairs.unassigned"
                :standalone="isInSelectedBases(key)"
                :timezone="_timezone"
                :key="key"
                :group="group"
              />
            </div>
          </div>
          <div class="assigned-flight-list__flight-group" v-if="hasPairs('pic_missing')">
            <h5 class="assigned-flight-list__group-heading">PIC missing SIC Assigned</h5>
            <div class="assigned-flight-list__badge-groups">
              <pair-badge-group
                v-for="(group, key) in baseGroupedPairs.pic_missing"
                :standalone="isInSelectedBases(key)"
                :timezone="_timezone"
                :key="key"
                :group="group"
              />
            </div>
          </div>
          <div class="assigned-flight-list__flight-group" v-if="hasPairs('sic_missing')">
            <h5 class="assigned-flight-list__group-heading">SIC missing PIC Assigned</h5>
            <div class="assigned-flight-list__badge-groups">
              <pair-badge-group
                v-for="(group, key) in baseGroupedPairs.sic_missing"
                :standalone="isInSelectedBases(key)"
                :timezone="_timezone"
                :key="key"
                :group="group"
              />
            </div>
          </div>
          <div class="assigned-flight-list__flight-group" v-if="hasPairs('assigned')">
            <h5 class="assigned-flight-list__group-heading">Assigned Pairs</h5>
            <div class="assigned-flight-list__badge-groups">
              <pair-badge-group
                v-for="(group, key) in baseGroupedPairs.assigned"
                :standalone="isInSelectedBases(key)"
                :timezone="_timezone"
                :key="key"
                :group="group"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane v-if="flightCount" :label="`Flights (${flightCount})`">
        <div class="assigned-flight-list__flight-groups" v-loading="isLoading">
          <div class="assigned-flight-list__flight-group" v-if="hasFlights('unassigned_flights')">
            <h5 class="assigned-flight-list__group-heading">Unassigned Flights</h5>
            <flight-badge
              v-for="flight in assignedFlights.unassigned_flights"
              :timezone="_timezone"
              :key="flight.id"
              :flight="flight"
            />
          </div>
          <div class="assigned-flight-list__flight-group" v-if="hasFlights('pic_missing')">
            <h5 class="assigned-flight-list__group-heading">PIC missing SIC Assigned</h5>
            <flight-badge
              v-for="flight in assignedFlights.pic_missing"
              :timezone="_timezone"
              :key="flight.id"
              :flight="flight"
            />
          </div>
          <div class="assigned-flight-list__flight-group" v-if="hasFlights('sic_missing')">
            <h5 class="assigned-flight-list__group-heading">SIC missing PIC Assigned</h5>
            <flight-badge
              v-for="flight in assignedFlights.sic_missing"
              :timezone="_timezone"
              :key="flight.id"
              :flight="flight"
            />
          </div>
          <div class="assigned-flight-list__flight-group" v-if="hasFlights('assigned_flights')">
            <h5 class="assigned-flight-list__group-heading">Assigned Flights</h5>
            <flight-badge
              v-for="flight in assignedFlights.assigned_flights"
              :timezone="_timezone"
              :key="flight.id"
              :flight="flight"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </bottom-popper>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .assigned-flight-list {
    max-height: none;

    &__tabs {
      padding: 0 5px;
    }

    &__flight-groups {
      margin-bottom: 15px;
    }

    &__flight-group {
      display: flex;
      flex-flow: row wrap;

      &:not(:last-of-type) {
        margin-bottom: 5px;
      }

      .flight-badge {
        margin-bottom: 5px;
      }
    }

    &__group-heading {
      flex: 1 1 100%;
    }

    &__badge-groups {
      display: flex;
      flex-flow: row wrap;
    }

    &__timezone-picker {
      margin: 0 10px;
      max-width: 100px;
    }

    &__header {
      display: flex;
      align-items: center;
    }

    &__group-header {
    }

    &__holiday-label {
      background: #fef5e7;
      color: #909090;
      padding: 8px 10px;
      border-radius: 3px;
    }
  }
</style>
