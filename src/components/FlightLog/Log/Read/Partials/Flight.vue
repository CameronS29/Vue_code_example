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
  <collapse title="FLIGHT INFORMATION" class="log-view-flight" :gutterColor="false">
    <div class="log-view-flight__row">
      Aircraft tail number: {{flightlog.manifest.tail_number}}
    </div>
    <div class="log-view-flight__row">
        Aircraft type: {{flightlog.manifest.aircraft_type}}
    </div>
    <div class="log-view-flight__row">
        Type of operation(part 91/135): {{flightlog.flight.operating_under}}
    </div>
    <div class="log-view-flight__row">
        Flight number: {{flightlog.flight.flight_number}}
    </div>
    <div class="log-view-flight__row">
        Flying Pilot: {{flightlog.flying_pilot}}
    </div>
    <br>
    <div class="log-view-flight__row">
        Type of Operation(scheduled, etc): {{flightlog.flight.type_of_operations}}
    </div>
    <br>
    <div class="log-view-flight__row">
        Origin: {{flightlog.flight.origin}}
    </div>
    <div class="log-view-flight__row">
        Destination: {{flightlog.flight.destination}}
    </div>
    <br>
    <div class="log-view-flight__row">
        Scheduled <strong>Depature</strong> Date/time (UTC): {{ flightlog.flight.scheduled_departure|longDT }}
    </div>
    <div class="log-view-flight__row">
        Scheduled <strong>Arrival</strong> Date/time (UTC): {{ flightlog.flight.scheduled_arrival|longDT }}
    </div>
  </collapse>
</template>
