<script>
  import { DateTime } from 'luxon';

  export default {
    name: 'FlightPopover',

    props: {
      flight: {
        type: Object,
        required: true,
      },

      time: {
        type: Boolean,
        default: true,
      },
    },

    filters: {
      time(dateStr) {
        return DateTime.fromISO(dateStr).toLocaleString(DateTime.TIME_SIMPLE);
      },
    },
  };
</script>

<template>
  <el-popover class="flight-popover" placement="bottom" width="170" trigger="hover">
    <div class="flight-popover__bases">
      <el-tag type="info" size="small">{{ flight.origin }}</el-tag>
      &nbsp;→&nbsp;
      <el-tag type="info" size="small">{{ flight.destination }}</el-tag>
    </div>
    <div class="flight-popover__time" v-if="time">
      <span>{{ flight.scheduled_departure | time }}</span>
      &nbsp;→&nbsp;
      <span>{{ flight.scheduled_arrival | time }}</span>
    </div>

    <el-tag type="info" slot="reference" size="mini">
      {{ flight.flight_number }}
    </el-tag>
  </el-popover>
</template>

<style lang="scss">
  .flight-popover {
    margin-right: 5px;

    .el-tag {
      cursor: pointer;
    }

    &:last-child { margin-right: 0; }

    &__bases, &__time {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 5px;
    }
  }
</style>
