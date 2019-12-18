<script>
  import {mapGetters, mapActions} from 'vuex';
  import Collapse from '../../../../Common/Collapse.vue';

  export default {
    computed: {
      ...mapGetters('flightlog', [
        'flightlog'
      ]),
    },
    components: {
      Collapse
    }
  };
</script>

<template>
  <collapse title="PILOT INPUT" class="log-view-flight-input" :gutterColor="false">
    <div class="log-view-flight-input__row">
        Number of passengers on board: {{ flightlog.number_of_passengers}}
    </div>
    <br>
    <div class="log-view-flight-input__row">
        Actual date/time <strong>OUT</strong> (UTC): {{flightlog.actual_datetime_out|longDT}}
    </div>
    <div class="log-view-flight-input__row">
        Actual date/time <strong>OFF</strong> (UTC): {{flightlog.actual_datetime_off|longDT}}
    </div>
    <div class="log-view-flight-input__row">
        Actual date/time <strong>ON</strong> (UTC): {{flightlog.actual_datetime_on|longDT}}
    </div>
    <div class="log-view-flight-input__row">
        Actual date/time <strong>IN</strong> (UTC): {{flightlog.actual_datetime_in|longDT}}
    </div>
    <br>
    <div class="log-view-flight-input__row">
        Flight time: {{flightlog.flight_time}}
    </div>
    <div class="log-view-flight-input__row">
        Block time: {{flightlog.block_time}}
    </div>
    <br>
    <div class="log-view-flight-input__row">
        Night flight time: {{flightlog.night_flight_time}}
    </div>
    <div class="log-view-flight-input__row">
        Instrument flight time: {{flightlog.instrument_flight_time}}
    </div>
    <br>
    <div class="log-view-flight-input__row">
        Intial HOBBS: {{flightlog.initial_hobbs}}
    </div>
    <div class="log-view-flight-input__row">
        Final HOBBS: {{flightlog.final_hobbs}}
    </div>
    <br>
    <div class="log-view-flight-input__row">
        Fuel Burn: {{flightlog.fuel_burn}}
    </div>
    <br>
    <div class="log-view-flight-input__row">
        Number of takes-offs (day): {{flightlog.number_of_takeoffs_day}}
    </div>
    <div class="log-view-flight-input__row">
        Number of takes-offs (night): {{flightlog.number_of_takeoffs_night}}
    </div>
    <div class="log-view-flight-input__row">
        Number of landings (day): {{flightlog.number_of_landings_day}}
    </div>
    <div class="log-view-flight-input__row">
        Number of landings (night): {{flightlog.number_of_landings_night}}
    </div>
    <br>
    <div class="log-view-flight-input__row">
        Total number of landings: {{flightlog.total_number_of_landings}}
    </div>
    <br>
    <div class="log-view-flight-input__row">
        Approach type: {{flightlog.approach}}
    </div>
    <br>
    <div class="log-view-flight-input__row">
        Delay (if any): {{flightlog.delay}}
    </div>

    <div class="log-view-flight-input__row">
        Comments: {{flightlog.comments}}
    </div>
  </collapse>
</template>
