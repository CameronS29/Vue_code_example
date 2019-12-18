<script>
  import { DateTime } from 'luxon';

  export default {
    name: 'FlightBadge',

    props: {
      flight: {
        type: Object,
        required: true,
      },
      timezone: {
        type: [Boolean, String, Object],
        default: false,
      },
    },

    methods: {
      formatTime(dateStr) {
        const dateTime = this.timezone ? DateTime.fromISO(dateStr).setZone(this.timezone) : DateTime.fromISO(dateStr);
        return dateTime.toLocaleString(DateTime.TIME_24_SIMPLE);
      },
    },
  };
</script>

<template>
  <el-tooltip placement="top" :disabled="!flight.PIC && !flight.SIC">
    <div slot="content">
      <p v-if="flight.PIC">PIC: {{ flight.PIC }}</p>
      <p v-if="flight.SIC">SIC: {{ flight.SIC }}</p>
    </div>
    <div class="flight-badge">
      <div class="flight-badge__id">
        {{ flight.flight_number }}
      </div>
      <div class="flight-badge__airports">
        {{ flight.origin }} - {{ flight.destination }}
      </div>
      <div class="flight-badge__time">
        {{ formatTime(flight.scheduled_departure) }} - {{ formatTime(flight.scheduled_arrival) }}
      </div>
      <div class="flight-badge__pairing" v-if="flight.pair">
        {{ flight.pair }}
      </div>
    </div>
  </el-tooltip>
</template>

<style lang="scss">
  .flight-badge {
    margin-right: 5px;
    background-color: #e1f1f1;
    border-radius: 3px;
    padding-top: 5px;
    font-size: 10px;
    &__id, &__content, &__airports, &__time {
      padding: 0 5px;
    }
    &__time {
      margin-bottom: 3px;
    }
    &__pairing {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      height: 15px;
      background-color: #0179bc;
      font-size: 11px;
      font-weight: bold;
      border-radius: 0 0 3px 3px;
    }
  }
</style>
