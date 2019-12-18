<script>
  import {mapGetters, mapActions} from 'vuex';

  export default {
    computed: {
      ...mapGetters("flightlog/log", [
        "log",
      ]),
    },

    filters: {
      formatTime(time) {
        return moment.utc(time).format("MM/DD/YYYY HH:mm");
      }
    },
  }
</script>

<template>
  <div class="log-values" v-if="log">
    <div class="key-values">
      <div class="key-value">
        <div class="key">PIC</div>
        <div class="dash"></div>
        <div class="value">
          {{ log.manifest.pic_name }}
        </div>
      </div>
      <div class="key-value">
        <div class="key">SIC</div>
        <div class="dash"></div>
        <div class="value">
          {{ log.manifest.sic_name }}
        </div>
      </div>
      <div class="key-value">
        <div class="key">Reporting Pilot</div>
        <div class="dash"></div>
        <div class="value">
          {{ log.reporting_profile }}
        </div>
      </div>
      <div class="key-value">
        <div class="key">Flight #</div>
        <div class="dash"></div>
        <div class="value">
          {{ log.flight.flight_number }}
        </div>
      </div>
      <div class="key-value">
        <div class="key">Departure</div>
        <div class="dash"></div>
        <div class="value">
          {{ log.actual_datetime_on | formatTime }}
        </div>
      </div>
      <div class="key-value">
        <div class="key">Arrival</div>
        <div class="dash"></div>
        <div class="value">
          {{ log.actual_datetime_in | formatTime }}
        </div>
      </div>
      <div class="key-value">
        <div class="key">Origin</div>
        <div class="dash"></div>
        <div class="value">
          {{ log.flight.origin }}
        </div>
      </div>
      <div class="key-value">
        <div class="key">Destination</div>
        <div class="dash"></div>
        <div class="value">
          {{ log.flight.destination }}
        </div>
      </div>
      <div class="key-value">
        <div class="key">Flight time</div>
        <div class="dash"></div>
        <div class="value">
          {{ log.flight_time }}
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  .log-values {
    margin-bottom: 15px;
  }
</style>
