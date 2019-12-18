<script>
  import ActualTimeLog from './Logs/ActualTimeLog.vue';
  import ExternalSyncCommit from './Logs/ExternalSyncCommit.vue';
  import LegacyCommit from './Logs/LegacyCommit.vue';
  import WeightBalanceLogConfirmation from './Logs/WeightBalanceLogConfirmation.vue';
  import FlightStatusCommitter from './Logs/FlightStatusCommitter.vue';
  import DiversionTypeCommit from './Logs/DiversionTypeCommit.vue';
  import SecurityCheckLog from './Logs/SecurityCheckLog.vue';
  import CopyFlightCommit from './Logs/CopyFlightCommit.vue';
  import ScheduledFightAssignment from './Logs/ScheduledFlightAssignment.vue';
  import AircraftTypeCommitter from './Logs/AircraftTypeCommitter.vue';

  const COMMIT_MAP = {
    'flightlog.ActualDateTimeCommit': ActualTimeLog,
    'flightlog.CopyFlightCommit': CopyFlightCommit,
    'flight.ExternalSyncCommit': ExternalSyncCommit,
    'flight.LegacyCommit': LegacyCommit,
    'flight.FlightStatusCommitter': FlightStatusCommitter,
    'wb.WeightBalanceLogConfirmation': WeightBalanceLogConfirmation,
    'flight.DiversionTypeCommit': DiversionTypeCommit,
    'security_form.SecuritySearchCommit': SecurityCheckLog,
    'fdt.ScheduledFlightAssignment': ScheduledFightAssignment,
    'flight.ScheduledAircraftTypeCommit': AircraftTypeCommitter,
  };

  export default {
    props: { log: Object },

    methods: {
      getComponent(commitType) {
        return COMMIT_MAP[commitType];
      },
    },
  };
</script>

<template>
  <component :log="log" :is="getComponent(log.commit_type)" />
</template>
