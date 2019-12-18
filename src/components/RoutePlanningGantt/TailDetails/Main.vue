<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { DateTime } from 'luxon';
  import { uniq, throttle, debounce, sortBy, flatten, find } from 'lodash';
  import compareAsc from 'date-fns/compareAsc';

  import { vuexProperty } from 'utils/helpers';
  import { TAIL_STATUSES } from 'store/modules/dispatch/e-checklist';
  import HorizontalScrollable from 'Common/HorizontalScrollable.vue';
  import { getDeparture, filterBySearchQuery } from 'store/modules/routeplanningGantt/utils';
  import FlightTable from './FlightTable.vue';
  import Pilot from './Pilot.vue';
  import Airport from './Airport.vue';
  import ChangeStatusPopover from '../../Dispatch/FlightList/ChangeStatusPopover.vue';

  const prop = vuexProperty({ attr: 'airportInfoProps', mutation: 'setAirportInfoProps' });

  export default {
    created() {
      this.setStartDate(this.filters.dateStart);
      if (!this.airportList.length) this.getAllAvailableAirports();
    },
    components: {
      FlightTable,
      Pilot,
      Airport,
      ChangeStatusPopover,
      HorizontalScrollable,
    },
    computed: {
      ...mapGetters('airports', {
        airportList: 'airports',
      }),
      ...mapState('routeplanningGantt', [
        'filters',
      ]),
      ...mapGetters('routeplanningGantt', [
        'detailedViewTail',
        'tailDetailedFullHeight',
        'fullHeight',
        'dynamicAreasHeight',
      ]),
      ...mapState('dispatch/e-checklist', [
        'startDate',
        'flightRange',
        'flights',
        'legality',
        'pilots',
        'airports',
        'airportInfoProps',
      ]),
      ...mapGetters('dispatch/e-checklist', [
        'startDateUTC',
        'isLoading',
        'atLeastOneAirportInfoPropEnabled',
      ]),
      ...mapGetters('dispatch/e-checklist/airportsLoading', {
        airportsLoading: 'isLoading',
      }),
      flightRangeModel: {
        get() {
          return this.flightRange;
        },
        set(value) {
          return this.setFlightRange(parseFloat(value));
        },
      },
      startDateModel: {
        get() {
          return DateTime.fromISO(this.startDate)
            .toJSDate();
        },
        set(value) {
          const date = DateTime.fromJSDate(value)
            .toISO();

          return this.setStartDate(date);
        },
      },
      filteredFlights() {
        if (!this.detailedViewTail) return [];

        return filterBySearchQuery(this.detailedViewTail.flights.filter((flight) => {
          const flightStart = flight.actual_datetime_out || flight.scheduled_departure;
          const startDate = this.startDateUTC.startOf('day');

          return (compareAsc(flightStart, startDate.toISO()) === 1)
            && (compareAsc(startDate.plus({ days: this.flightRange })
              .toISO(), flightStart) === 1);
        }), this.filters.searchQuery);
      },
      mergedFlights() {
        return sortBy(
          this.filteredFlights.map(flight => ({ ...flight, ...this.flights[flight.id] })),
          flight => getDeparture(flight),
        );
      },
      hobbsLeft() {
        return (this.detailedViewTail.aircraft.next_mx - this.detailedViewTail.aircraft.projected_hobbs).toFixed(1);
      },
      notesModel: {
        get() {
          return this.detailedViewTail.aircraft.dispatcher_notes;
        },
        set: debounce(function (value) {
          this.patchDetailedViewTail({ dispatcher_notes: value });
        }, 800),
      },
      statusModel: {
        get() {
          return this.detailedViewTail.aircraft.status;
        },
        set(value) {
          this.patchDetailedViewTail({ status: value });
        },
      },
      notes: prop('notes'),
      metar: prop('metar'),
      notam: prop('notam'),
      taf: prop('taf'),

      style() {
        return {
          height: `${(this.dynamicAreasHeight > this.fullHeight)
            ? this.tailDetailedFullHeight
            : this.dynamicAreasHeight * this.tailDetailedFullHeight / this.fullHeight}px`,
        };
      },
    },
    methods: {
      ...mapActions('airports', [
        'getAllAvailableAirports',
      ]),
      ...mapMutations('routeplanningGantt', [
        'setDetailedViewTail',
      ]),
      ...mapActions('routeplanningGantt', [
        'patchDetailedViewTail',
      ]),
      ...mapMutations('dispatch/e-checklist', [
        'setFlightRange',
        'setStartDate',
        'setAirportInfoProps',
      ]),
      ...mapActions('dispatch/e-checklist', [
        'fetchFlights',
        'fetchFlightLegalities',
        'fetchPilots',
        'fetchAirports',
      ]),
      close() {
        this.setDetailedViewTail(null);
      },
      fetchLinked() {
        const airportIds = this.filteredFlights.reduce((acc, flight) => {
          return [...acc, flight.origin.id, flight.destination.id];
        }, []);
        const pilotIds = this.filteredFlights.reduce((acc, flight) => {
          const ids = [];

          if (flight.actual_pic) ids.push(flight.actual_pic.id);
          if (flight.actual_sic) ids.push(flight.actual_sic.id);
          if (flight.scheduled_pic) ids.push(flight.scheduled_pic.id);
          if (flight.scheduled_sic) ids.push(flight.scheduled_sic.id);

          return [...acc, ...ids];
        }, []);

        this.fetchPilots(uniq(pilotIds));
        this.fetchAirports(uniq(airportIds));
      },
      iataById(airportId) {
        const airport = find(
          flatten(this.filteredFlights.map(flight => [flight.origin, flight.destination])),
          airport => airportId === airport.id,
        );
        return airport ? airport.iata : '';
      },

      handleRowMouseEnter(row) {
        this.activeFlight = row;
      },
      handleRowMouseLeave() {
        this.activeFlight = false;
      },
    },
    watch: {
      'filters.dateStart'(value) {
        const date = DateTime.fromISO(value, { setZone: true })
          .setZone('local', { keepLocalTime: true })
          .toISO();

        this.setStartDate(date);
      },
      detailedViewTail(value) {
        if (value) this.fetchLinked();
      },
      filteredFlights: throttle(function (flights) {
        if (flights.length) {
          this.fetchFlights(flights.map(flight => flight.flight_number));
          this.fetchFlightLegalities(flights.map(flight => flight.id));
          this.fetchLinked();
        }
      }, 5e3),
    },
    data() {
      return {
        TAIL_STATUSES,
        activeFlight: false,
      };
    },
  };
</script>

<template>
  <div class="tail-details" v-if="detailedViewTail" v-loading="isLoading" :style="style">
    <change-status-popover path-mutation="dispatch/e-checklist/patchFlight"/>

    <header class="tail-details__header">
      <h2 class="tail-details__title">
        {{ detailedViewTail.aircraft.registration }}
        <span class="tail-details__type">{{ detailedViewTail.aircraft.type.type }}</span>
      </h2>
      <horizontal-scrollable hide-scrollbar class="tail-details__props-wrapper">
        <div class="tail-details__aircraft-specific">
          <div class="tail-details__aircraft-prop">
            <div class="tail-details__aircraft-prop-key">battery</div>
            <div class="tail-details__aircraft-prop-value">{{ detailedViewTail.aircraft.batteries }}</div>
          </div>
          <div class="tail-details__aircraft-prop">
            <div class="tail-details__aircraft-prop-key">LPV</div>
            <div class="tail-details__aircraft-prop-value">{{ detailedViewTail.aircraft.lpv ? 'yes' : 'no' }}</div>
          </div>
          <div class="tail-details__aircraft-prop">
            <div class="tail-details__aircraft-prop-key">Next MX</div>
            <div class="tail-details__aircraft-prop-value">{{ detailedViewTail.aircraft.next_mx }}</div>
          </div>
          <div class="tail-details__aircraft-prop">
            <div class="tail-details__aircraft-prop-key">Hobbs Left</div>
            <div class="tail-details__aircraft-prop-value">{{ hobbsLeft }}</div>
          </div>
          <div class="tail-details__aircraft-prop">
            <div class="tail-details__aircraft-prop-key">Current Hobbs</div>
            <div class="tail-details__aircraft-prop-value">{{ detailedViewTail.aircraft.hobbs }}</div>
          </div>
          <div class="tail-details__aircraft-prop">
            <div class="tail-details__aircraft-prop-key">Projected Hobbs</div>
            <div class="tail-details__aircraft-prop-value">{{ detailedViewTail.aircraft.projected_hobbs }}</div>
          </div>
          <div class="tail-details__aircraft-prop">
            <div class="tail-details__aircraft-prop-key">MX status</div>
            <div class="tail-details__aircraft-prop-value">
              <el-select size="mini" v-model="statusModel" placeholder="Status" style="width: 90px">
                <el-option
                  v-for="(status, index) in TAIL_STATUSES"
                  :key="index"
                  :label="status"
                  :value="index" />
              </el-select>
            </div>
          </div>
          <!--<div class="tail-details__aircraft-prop">-->
          <!--<div class="tail-details__aircraft-prop-key">MEL count</div>-->
          <!--<div class="tail-details__aircraft-prop-value">###</div>-->
          <!--</div>-->
          <div class="tail-details__flight-list-filters">
            <el-date-picker
              v-model="startDateModel"
              type="date"
              placeholder="Pick a start day" size="mini" />
            <span class="tail-details__next-label">+ next</span>
            <el-radio-group v-model="flightRangeModel" size="mini">
              <el-radio-button :label="1.5">36 hours</el-radio-button>
              <el-radio-button label="2">2 days</el-radio-button>
              <el-radio-button label="3">3 days</el-radio-button>
              <el-radio-button label="7">1 week</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </horizontal-scrollable>
    </header>
    <div class="tail-details__content-wrapper">
      <div class="tail-details__content">
        <div class="tail-details__flight-list">
          <flight-table
            @cell-mouse-enter="handleRowMouseEnter"
            @cell-mouse-leave="handleRowMouseLeave"
            :flights="mergedFlights" />
        </div>
        <div class="tail-details__mels">
          <div class="tail-details__half-width">
            <div class="tail-details__aircraft-prop-key">MELs</div>
            <el-table
              class="table_extra-small"
              size="mini"
              :data="[]"
              style="width: 100%">
              <el-table-column
                label="Description" />
              <el-table-column
                width="100"
                label="Expiring date" />
              <el-table-column
                label="Restrictions" />
            </el-table>
          </div>
          <div class="tail-details__half-width">
            <div class="tail-details__aircraft-prop-key">Notes</div>
            <el-input
              class="tail-details__notes"
              type="textarea"
              :rows="7"
              placeholder="Notes..."
              v-model="notesModel" />
          </div>
        </div>
      </div>
      <div class="tail-details__ref">
        <div class="tail-details__crew">
          <h3 class="tail-details__ref-header">Crew</h3>
          <div class="tail-details__crew-list">
            <pilot :aircraft="detailedViewTail.aircraft" :active-flight="activeFlight"
                   :pilot="pilot" v-for="pilot in pilots" :key="pilot.id" />
          </div>
        </div>
        <div class="tail-details__airports" v-loading="airportsLoading">
          <h3 class="tail-details__ref-header ">
            Airports
            <div class="tail-details__airport-info-switchers">
              <el-checkbox v-model="notes">Notes</el-checkbox>
              <el-checkbox v-model="metar">METAR</el-checkbox>
              <!--<el-checkbox v-model="notam">NOTAM</el-checkbox>-->
              <el-checkbox v-model="taf">TAF</el-checkbox>
            </div>
          </h3>
          <div class="tail-details__airport-list" v-if="atLeastOneAirportInfoPropEnabled">
            <airport :active-flight="activeFlight"
                     :airport="airport" v-for="airport in airports" :key="airport.id" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style lang="scss">
  .tail-details {
    /*position: absolute;*/
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 2000;
    border-radius: 3px;
    background: #fff;
    display: flex;
    flex-flow: column;

    &__header {
      display: flex;
      align-items: flex-end;
      padding: 10px;
      flex: 0 0 48px;
    }

    &__title {
      font-weight: bold;
      margin: 0;
      min-width: 160px;
    }

    &__type {
      font-size: 16px;
      display: inline-block;
      font-weight: normal;
    }

    &__content-wrapper {
      display: flex;
    }

    &__content {
      padding: 0 10px 10px;
      overflow-y: auto;
      flex: 1 1;
    }

    &__ref {
      padding: 0 10px;
      overflow-y: auto;
      flex: 0 0 500px;
    }

    &__props-wrapper {
      min-width: 1px;
    }

    &__aircraft-specific {
      margin-left: 20px;
      display: flex;
    }

    &__aircraft-prop {
      padding: 0 10px 0 0;
      display: flex;
      align-items: flex-end;
    }

    &__aircraft-prop-key {
      color: rgba(0, 0, 0, 0.35);
      white-space: nowrap;
      margin-right: 4px;
    }

    &__aircraft-prop-value {
      font-weight: bold;
      font-size: 16px;
    }

    &__flight-list {
      margin-bottom: 10px;
    }

    &__flight-list-filters {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-left: auto;
      align-self: flex-end;
      width: 580px;
      flex: 0 0 580px;

      label {
        margin-bottom: 0;
      }
    }

    &__next-label {
      margin: 0 5px;
    }

    &__mels {
      display: flex;
      justify-content: space-between;
    }

    &__half-width {
      flex: 0 0 calc(50% - 10px);
      min-width: 1px;
    }

    &__ref-header {
      margin: 0;
      padding-bottom: 5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 90;
      background: #fff;
    }

    &__crew {
      margin-bottom: 10px;
    }

    &__airport-list {
      position: relative;
    }

    &__airport-info-switchers {
      label {
        margin-bottom: 0;
      }
      .el-checkbox + .el-checkbox {
        margin-left: 10px;
      }
    }
  }
</style>
