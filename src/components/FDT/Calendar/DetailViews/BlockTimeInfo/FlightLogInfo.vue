<script>
  import ContainerView from '../Common/ContainerView.vue';
  import { formatDate } from '../Common/utils';

  export default {
    name: 'LogDependantFlightInfo',

    props: {
      log: {
        type: Object,
        default: () => ({}),
      },
    },

    components: { ContainerView },

    methods: {
      format: formatDate,
    },
  };
</script>

<template>
  <container-view title="Flight Log Info">
    <div class="blocktime__prop-group">
      Flight Log Status: {{ log.opened ? 'Open' : 'Completed' }}
    </div>
    <div class="blocktime__prop-group">
      Flight Manifest: #{{ log.manifest.number }}
    </div>
    <div class="blocktime__prop-group">
      Aircraft tail number: {{ log.manifest.tail_number }} <br>
      Aircraft type: {{ log.manifest.aircraft_type }} <br>
      Type of operations (part 91/135): {{ log.flight.operating_under }} <br>
      Flight number: {{ log.flight.flight_number }} <br>
      Flying pilot: {{ log.flying_pilot }} <br>
      Type of operation: {{ log.flight.type_of_operations }} <br>
    </div>
    <div class="blocktime__prop-group">
      Origin: {{ log.flight.origin }} <br>
      Destination: {{ log.flight.destination }}
    </div>
    <div class="blocktime__prop-group">
      Scheduled Departure Time (UTC): {{ format(log.flight.scheduled_departure) }} <br>
      Scheduled Arrival Time (UTC): {{ format(log.flight.scheduled_arrival) }} <br>
    </div>
  </container-view>
</template>
