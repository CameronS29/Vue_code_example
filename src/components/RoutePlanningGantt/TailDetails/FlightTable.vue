<script>
  import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
  import { DateTime } from 'luxon';
  import { isString, isObject } from 'lodash';

  import { SET_FLIGHT } from 'store/modules/flights';
  import { SET_EDITABLE_FLIGHT, ERROR_STATUSES } from 'store/modules/dispatch/status-change';
  import {
    getDestination, getOrigin, getDeparture, getArrival,
    getPIC, getSIC,
  } from 'store/modules/routeplanningGantt/utils';

  import FlightTable from '../../Dispatch/FlightList/Mixins/FlightTable';
  import DateTimeCell from './DateTimeCell.vue';
  import DepartureTicker from './DepartureTicker.vue';

  export default {
    created() {
      if (!this.availableOfficialCodes.length) {
        this.getAvailableOfficialCodes();
      }
    },
    data() {
      return { ERROR_STATUSES };
    },
    props: {
      flights: {
        type: Array,
        required: true,
      },
    },
    components: {
      DateTimeCell,
      DepartureTicker,
    },
    mixins: [FlightTable],
    computed: {
      ...mapState('dispatch/flight-list/status-change', [
        'availableFlightStatuses',
        'availableOfficialCodes',
        'editableFlightId',
      ]),
      ...mapState('dispatch/e-checklist', {
        legalities: 'legality',
      }),
      ...mapState('routeplanningGantt', [
        'observableDate',
      ]),
      ...mapGetters('routeplanningGantt', [
        'detailedViewTail',
      ]),
    },
    methods: {
      ...mapMutations('flights', [SET_FLIGHT]),
      ...mapActions('flights', ['fetchFlight']),
      ...mapMutations('dispatch/flight-list/status-change', [SET_EDITABLE_FLIGHT]),
      ...mapActions('dispatch/flight-list/status-change', [
        'getAvailableOfficialCodes',
      ]),
      showDetailView(flight) {
        this[SET_FLIGHT](flight);
        this.fetchFlight(flight.id);
      },
      handleStatusClick(flight) {
        this[SET_EDITABLE_FLIGHT](flight);
      },

      projectedHobbs(flight) {
        const finalHobbs = parseFloat(flight.final_hobbs);
        if (finalHobbs) {
          return finalHobbs;
        } else {
          return flight.projected_hobbs;
        }
      },
      hobbsLeft(flight) {
        return (this.detailedViewTail.aircraft.next_mx - this.projectedHobbs(flight)).toFixed(1);
      },

      origin(flight) {
        return getOrigin(flight);
      },
      destination(flight) {
        return getDestination(flight);
      },

      departureDateTime(flight) {
        return getDeparture(flight);
      },
      arrivalDateTime(flight) {
        return getArrival(flight);
      },
      delay(flight) {
        if (!flight.estimated_departure) return null;

        const { minutes } = DateTime.fromISO(flight.estimated_departure)
          .diff(DateTime.fromISO(flight.scheduled_departure), ['minutes']);

        return minutes ? `${minutes} min` : '';
      },

      pic(flight) {
        return getPIC(flight);
      },
      sic(flight) {
        return getSIC(flight);
      },

      legality(flightId) {
        return this.legalities[flightId];
      },
      picLegalityCalculated(flightId) {
        return this.legality(flightId) && this.legality(flightId).pic;
      },
      picLegal(flightId) {
        return this.legality(flightId).pic.is_legal;
      },
      sicLegalityCalculated(flightId) {
        return this.legality(flightId) && this.legality(flightId).sic;
      },
      sicLegal(flightId) {
        return this.legality(flightId).sic.is_legal;
      },
    },
    filters: {
      wbLogStatus(flight) {
        if (!flight.wb_pic_pined) {
          return 'Open';
        } else if (!flight.wb_dispatch_pined) {
          return 'PIC Pinned';
        }

        return 'Dispatch Pinned';
      },
      fullName(pilot) {
        if (isString(pilot)) {
          return pilot;
        } else if (isObject(pilot)) {
          return `${pilot.first_name} ${pilot.last_name}`;
        }

        return '';
      },
    },
  };
</script>

<template>
  <el-table class="table_extra-small tail-details-flights"
            @cell-mouse-enter="row => $emit('cell-mouse-enter', row)"
            @cell-mouse-leave="row => $emit('cell-mouse-leave', row)"
            size="mini" :data="flights" :height="`${flights.length * 24 + 60}`">
    <el-table-column
      fixed="left"
      prop="flight_number"
      width="60px"
      label="#">
      <template slot-scope="props">
        <span
          class="tail-details-flights__flight-number-btn"
          @click="showDetailView(props.row)">{{ props.row.flight_number }}</span>
      </template>
    </el-table-column>

    <el-table-column
      prop="origin.iata"
      label="Origin">
      <template slot-scope="props">
        {{ origin(props.row).iata }}
      </template>
    </el-table-column>

    <el-table-column
      prop="destination.iata"
      label="Dest.">
      <template slot-scope="props">
        {{ destination(props.row).iata }}
      </template>
    </el-table-column>

    <el-table-column
      prop="status"
      width="170px"
      label="Status">
      <template slot-scope="props">
        <el-button-group>
          <el-button
            :class="getStatusBtnClass(props.row.status)"
            size="mini"
            @click.stop="handleStatusClick(props.row)"
            :type="getStatusBtnType(props.row)">
            {{ getStatusBtnTitle(props.row) }}
          </el-button>
          <el-button
            v-if="props.row.is_delayed && props.row.status != 4"
            class="flight-list-table__status-btn flight-list-table__status-btn_delayed"
            type="primary"
            @click.stop="handleStatusClick(props.row)"
            size="mini">
            Delayed <span v-if="props.row.official_code">{{ getOfficialCode(props.row) }}</span>
          </el-button>
        </el-button-group>
      </template>
    </el-table-column>

    <el-table-column
      prop="scheduled_departure"
      width="100"
      label="Sch. Dep.">
      <template slot-scope="props">
        <date-time-cell :datetime="props.row.scheduled_departure" />
      </template>
    </el-table-column>

    <el-table-column
      prop="scheduled_arrival"
      width="100"
      label="Sch. Arr.">
      <template slot-scope="props">
        <date-time-cell :datetime="props.row.scheduled_arrival" />
      </template>
    </el-table-column>

    <el-table-column
      prop="estimated_departure"
      width="100"
      label="Departure">
      <template slot-scope="props">
        <date-time-cell :datetime="props.row.actual_datetime_out || props.row.estimated_departure" />
      </template>
    </el-table-column>

    <el-table-column
      prop="estimated_arrival"
      width="100"
      label="Arrival">
      <template slot-scope="props">
        <date-time-cell
          :datetime="props.row.actual_datetime_in || props.row.estimated_arrival"
          :estimated="props.row.actual_datetime_in === null && props.row.estimated_arrival"
        />
      </template>
    </el-table-column>

    <el-table-column
      prop="flightlog.manifest.pic_name"
      :show-overflow-tooltip="true"
      min-width="130"
      label="PIC">
      <template slot-scope="props">
        <span class="tail-details-flights__legality" v-if="picLegalityCalculated(props.row.id)">
          <i v-if="picLegal(props.row.id)" class="fa fa-check" />
          <i v-else class="fa fa-times" />
        </span>
        {{ pic(props.row) | fullName }}
      </template>
    </el-table-column>

    <el-table-column
      prop="flightlog.manifest.sic_name"
      :show-overflow-tooltip="true"
      min-width="130"
      label="SIC">
      <template slot-scope="props">
        <span class="tail-details-flights__legality" v-if="sicLegalityCalculated(props.row.id)">
          <i v-if="sicLegal(props.row.id)" class="fa fa-check" />
          <i v-else class="fa fa-times" />
        </span>
        {{ sic(props.row) | fullName }}
      </template>
    </el-table-column>

    <el-table-column
      label="Hobbs left">
      <template slot-scope="props">
        {{ hobbsLeft(props.row) }}
      </template>
    </el-table-column>

    <el-table-column
      label="Flight Log Status">
      <template slot-scope="props">
        <router-link
          :to="{ name: 'dispatch_log_edit', params: {
            logId: props.row.flightlog.id,
            id: props.row.flightlog.manifest.id,
          } }"
          v-if="props.row.flightlog"
          title="Show log details"
        >
          {{ props.row.flightlog.open ? 'Open' : 'Completed' }}
        </router-link>
      </template>
    </el-table-column>

    <el-table-column
      width="120"
      label="WB Log Status">
      <template slot-scope="props">
        <router-link
          v-if="props.row.wb_log"
          :to="{ name: 'wb_log', params: { id: props.row.wb_log } }"
          title="Show log details"
        >
          {{ props.row | wbLogStatus }}
        </router-link>
      </template>
    </el-table-column>

    <el-table-column
      label="Delay">
      <template slot-scope="props">
        {{ delay(props.row) }}
      </template>
    </el-table-column>

    <el-table-column
      width="120"
      label="Until Departure">
      <template slot-scope="props">
        <departure-ticker :to="departureDateTime(props.row)" />
      </template>
    </el-table-column>

    <el-table-column
      prop="type_of_operations.name"
      label="Op. Type" />

    <el-table-column
      prop="operating_under.operation"
      label="Op. Under" />
  </el-table>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';
  @import "../../Dispatch/FlightList/flight-status";

  .tail-details-flights {
    &__flight-number-btn {
      cursor: pointer;
      color: $blue;
      border-bottom: 1px dotted lighten($blue, 30%);
      transition: .2s;
    }

    .fa-check {
      color: $navy;
    }
    .fa-times {
      color: $red;
    }
  }

  .flight-list-table {
    &__status-btn {
      font-size: 11px;
      padding: 2px 4px;
    }
  }
</style>
