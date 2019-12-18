<script>
  import Columns from 'Common/Columns.vue';
  import Column from 'Common/Column.vue';
  import ContainerView from '../Common/ContainerView.vue';
  import { formatDate } from '../Common/utils';

  export default {
    name: 'LogInfo',

    props: {
      log: {
        type: Object,
        default: () => ({}),
      },
    },

    components: {
      Column,
      Columns,
      ContainerView,
    },

    methods: {
      format: formatDate,
    },
  };
</script>

<template>
  <container-view title="Pilot Input">
    <columns :cols="2">
      <column class="blocktime__pilot-input">
        <div class="blocktime__prop-group">
          Number of passengers on board: {{ log.number_of_passengers }}
        </div>
        <div class="blocktime__prop-group">
          <strong>Actual date/times in (UTC):</strong><br>
          OUT: {{ format(log.actual_datetime_out) }}<br>
          OFF: {{ format(log.actual_datetime_off) }}<br>
          ON: {{ format(log.actual_datetime_on) }}<br>
          IN: {{ format(log.actual_datetime_in) }}<br>
        </div>
        <div class="blocktime__prop-group">
          Flight Time: {{ log.flight_time }}<br>
          Block Time: {{ log.block_time }}
        </div>
        <div class="blocktime__prop-group">
          Night flight time: {{ log.night_flight_time }}<br>
          Instrument flight time: {{ log.instrument_flight_time }}
        </div>
        <div class="blocktime__prop-group">
          Initial HOBBS: {{ log.initial_hobbs }}<br>
          Final HOBBS: {{ log.final_hobbs }}<br>
          Engine runs: {{ log.engine_runs }}
        </div>
      </column>
      <column>
        <div class="blocktime__prop-group">
          <strong>Number of takeoffs:</strong><br>
          day: {{ log.number_of_takeoffs_day }}<br>
          night: {{ log.number_of_takeoffs_night }}<br>
          <strong>Number of landings:</strong><br>
          day: {{ log.number_of_landings_day }}<br>
          night: {{ log.number_of_landings_night }}
        </div>
        <div class="blocktime__prop-group">
          Total number of landings: {{log.total_number_of_landings}}
        </div>
        <div class="blocktime__prop-group">
          Approach type: {{ log.approach }}
        </div>
        <div class="blocktime__prop-group">
          Delay (if any): {{ log.delay }}
        </div>
        <div class="blocktime__prop-group">
          Comments: {{ log.comments }}
        </div>
      </column>
    </columns>
  </container-view>
</template>
