<script>
  import { mapState, mapMutations, mapActions } from 'vuex';
  import { find } from 'lodash';

  import BaseMixin from './BaseMixin';

  export default {
    mixins: [BaseMixin],
    created() {
      if (!this.aircraftTypes.length) {
        this.getAircraftTypes();
      }
    },
    computed: {
      ...mapState('aircraft', ['aircraftTypes']),
      type() {
        if (!this.aircraftTypes.length) return null;

        return find(this.aircraftTypes, { id: this.log.commit.aircraft_type }).name;
      },
    },
    methods: {
      ...mapActions('aircraft', ['getAircraftTypes']),
    },
  };
</script>
§
<template>
  <div class="flight-status-log__event">
    <div class="flight-status-log__event-datetime">
      <span class="flight-status-log__event-date">{{ date }}</span>
      <span class="flight-status-log__event-time">{{ time }}</span>
    </div>
    <div class="flight-status-log__event-message">
      Aircraft type changed to <strong>{{ type }}</strong>
    </div>
  </div>
</template>
