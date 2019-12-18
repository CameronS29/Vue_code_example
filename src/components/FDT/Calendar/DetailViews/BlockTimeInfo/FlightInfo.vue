<script>
  import ContainerView from '../Common/ContainerView.vue';
  import { formatDate } from '../Common/utils';

  export default {
    name: 'FlightInfo',

    props: {
      flight: {
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
  <container-view v-if="flight" title="Flight Info">
    <div class="blocktime__prop-group">
      Type of operations (part 91/135): {{ flight.operating_under }} <br>
      Flight number: {{ flight.flight_number }} <br>
      Type of operation: {{ flight.type_of_operations }} <br>
    </div>
    <div class="blocktime__prop-group">
      Origin: {{ flight.origin }} <br>
      Destination: {{ flight.destination }}
    </div>
    <div class="blocktime__prop-group">
      Scheduled Departure Time (UTC): {{ format(flight.scheduled_departure) }} <br>
      Scheduled Arrival Time (UTC): {{ format(flight.scheduled_arrival) }} <br>
    </div>
  </container-view>
</template>
