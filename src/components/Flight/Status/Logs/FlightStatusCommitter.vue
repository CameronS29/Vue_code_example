<script>
  import { mapState, mapMutations, mapActions } from 'vuex';
  import { find } from 'lodash';
  import BaseMixin from './BaseMixin';

  export default {
    mixins: [BaseMixin],
    created() {
      if (this.availableOfficialCodes.length === 0) {
        this.getAvailableOfficialCodes();
      }
    },
    computed: {
      ...mapState('dispatch/flight-list/status-change', [
        'availableFlightStatuses',
        'availableOfficialCodes',
      ]),
      officialCode() {
        const offCode = find(this.availableOfficialCodes, { id: this.commit.official_code });

        return offCode ? `${offCode.code} ${offCode.description} ${offCode.verbose}` : '';
      },
    },
    methods: {
      ...mapActions('dispatch/flight-list/status-change', [
        'getAvailableOfficialCodes',
      ]),
      goToLog() {

      },
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
      Flight status change to <strong>{{ availableFlightStatuses[commit.flight_status] }}</strong>
      <span v-if="officialCode">. Official code: {{ officialCode }}</span>
      <span v-if="commit.reason">. Reason: {{ commit.reason }}</span>
      <strong v-if="commit.bad_weather">. Bad weather</strong>
    </div>
  </div>
</template>
