<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { DateTime } from 'luxon';

  import { SET_FLIGHT } from 'store/modules/flights';
  import { FLIGHT_STATUSES } from 'store/modules/dispatch/status-change';
  import {
    getDestination, getOrigin, getDeparture, getArrival,
    getPIC, getSIC,
  } from 'store/modules/routeplanningGantt/utils';
  import { statuses } from 'store/modules/flights/consts';

  export default {
    props: {
      flight: {
        type: Object,
        required: true,
      },
      aircraft: {
        type: Object,
        required: true,
      },
    },
    computed: {
      ...mapState('routeplanningGantt', [
        'filters',
      ]),
      date() {
        return DateTime.fromISO(this.arrival, { zone: 'UTC' }).toFormat('MM/dd');
      },
      origin() {
        return getOrigin(this.flight).iata;
      },
      destination() {
        return getDestination(this.flight).iata;
      },
      departure() {
        return getDeparture(this.flight);
      },
      arrival() {
        return getArrival(this.flight);
      },
      pic() {
        return getPIC(this.flight);
      },
      sic() {
        return getSIC(this.flight);
      },
      projectedHobbs() {
        if (this.isCancelled) return '';

        const finalHobbs = parseFloat(this.flight.final_hobbs);
        if (finalHobbs) {
          return finalHobbs;
        } else if (this.filters.live) {
          return this.flight.projected_hobbs;
        } else {
          return this.flight.projected_hobbs_draft;
        }
      },
      hobbsLeft() {
        if (this.isCancelled) return '';

        return (parseFloat(this.aircraft.next_mx) - this.projectedHobbs).toFixed(1);
      },
      flight_number() {
        return this.flight.flight_number;
      },
      flightMainInfoClass() {
        return {
          'flight-list-item__main-info': true,
          'flight-list-item__main-info_conflict': this.flight.isConflicting,
        };
      },
      status() {
        if (!this.flight.status) return '—';

        return FLIGHT_STATUSES[this.flight.status];
      },
      isCancelled() {
        return this.flight.status === statuses.CANCELED;
      },
    },
    methods: {
      ...mapMutations('flights', [SET_FLIGHT]),
      ...mapActions('flights', ['fetchFlight']),

      handleAddNextClick() {
        this.$emit('click-add-next', this.flight);
      },
      handleRemoveClick() {
        this.$emit('click-remove', this.flight);
      },
      handleFlightNumberClick() {
        this[SET_FLIGHT](this.flight);
        this.fetchFlight(this.flight.id);
      },
    },
    filters: {
      time(date) {
        if (!date) return '—';

        return DateTime.fromISO(date, { zone: 'UTC' })
          .toLocaleString(DateTime.TIME_24_SIMPLE);
      },
      name(pilot) {
        if (!pilot) return '—';

        return `${pilot.first_name} ${pilot.last_name}`;
      },

    },
  };
</script>

<template>
  <tr class="flight-list-item">
    <td>{{ date }}</td>
    <td>
      <span @click="handleFlightNumberClick" :class="flightMainInfoClass">
        {{ origin }} {{ this.flight.flight_number }} {{ destination }}
      </span>
    </td>
    <td>{{ flight.scheduled_departure | time }} → {{ flight.scheduled_arrival | time }}</td>
    <td>{{ flight.actual_datetime_out | time }} → {{ flight.actual_datetime_in | time }}</td>
    <td>{{ pic | name }}</td>
    <td>{{ sic | name }}</td>
    <td>{{ status }}</td>
    <td>{{ projectedHobbs }}</td>
    <td>{{ hobbsLeft }}</td>
    <td class="flight-list-item__buttons">
      <el-button size="mini" class="flight-list-item__button"
                 type="primary" icon="fa fa-fw fa-plus" @click="handleAddNextClick">
        Add next
      </el-button>
      <el-button size="mini" class="flight-list-item__button" v-if="!flight.actual_aircraft"
                 type="danger" icon="fa fa-fw fa-trash" @click="handleRemoveClick">
        Delete
      </el-button>
    </td>
  </tr>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .flight-list-item {
    margin-bottom: 20px;
    &__main-info {
      background-color: $black;
      text-align: center;
      border-radius: 3px;
      color: #fff;
      padding: 1px 5px;
      display: block;
      margin: 1px;
      cursor: pointer;
      font-size: 12px;

      &_conflict {
        background-color: $red;
      }
    }
    &__button {
      padding: 3px 15px;
    }
  }
</style>
