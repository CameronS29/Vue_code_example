<script>
  import { mapGetters } from 'vuex';
  import scheduleRowMixin from './utils/scheduleRowMixin';

  export default {
    name: 'TotalsListItem',
    mixins: [scheduleRowMixin],

    props: {
      totals: Object,
      showSxHours: Boolean,
      showActualHours: Boolean,
    },

    computed: {
      ...mapGetters('scheduling/calendar/pilotGrid', ['isPilotPending']),
    },
  };
</script>

<template>
  <div
    class="list-item scheduling-total-stats"
    :class="{ 'scheduling-total-stats_pending': isPilotPending(pilot.id),
              'list-item_highlighted': highlighted }"
    @mouseover="$emit('hover-pilot-row', pilot.id)"
    :style="rowStyle"
  >
    <div class="column" v-if="showSxHours">{{ totals.sx_times || 0 }}</div>
    <div class="column" v-if="showActualHours">{{ totals.duty_times || 0 }}</div>
    <div class="column">{{ totals.total_times || 0 }}</div>
    <div class="column">{{ totals.off_days.total || 0 }}</div>
    <div class="column">{{ totals.paid_offs.length }}</div>
    <div class="column">{{ totals.sick_days.length }}</div>
  </div>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .scheduling-total-stats {
    &_pending {
      color: transparentize($text-color, 0.5);
    }
  }
</style>
