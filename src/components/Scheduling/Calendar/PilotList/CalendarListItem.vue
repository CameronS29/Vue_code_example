<script>
  import { keyBy, get } from 'lodash';
  import { TYPE_OFF } from 'store/modules/scheduling/consts';

  import Day from './Day.vue';
  import scheduleRowMixin from './utils/scheduleRowMixin';

  export default {
    mixins: [scheduleRowMixin],

    props: {
      records: Object,
      manifests: Object,
      dates: Array,
      holidays: Object,
      selectionRange: Array,
      hasInitial: Boolean,
    },

    components: { Day },

    computed: {
      preferredOffMap() {
        return keyBy(this.pilot.preferred_off_days || []);
      },
    },

    methods: {
      isPreferredOff(date) {
        return (
          (date.weekday - 1) in this.preferredOffMap &&
          get(this.records[date.day], '[0].type') !== TYPE_OFF
        );
      },

      isWithinBatchSelection(date) {
        return (
          this.pilot.id === this.activePilotId &&
          this.selectionRange[0] <= date &&
          date <= this.selectionRange[1]
        );
      },
    },
  };
</script>

<template>
  <div @mouseover="$emit('hover-pilot-row', pilot.id)"
       class="list-item"
       :class="{'list-item_highlighted': highlighted}"
       :style="rowStyle">
    <day
      v-for="date in dates"
      :key="date.day"

      :blocks="records[date.day]"
      :manifests="manifests[date.day]"

      :date="date"
      :pilot-id="pilot.id"
      :has-initial="hasInitial"

      :is-holiday="date.day in holidays"
      :is-preferred-off="isPreferredOff(date)"
      :is-in-batch-selection="isWithinBatchSelection(date)"
    />
  </div>
</template>
