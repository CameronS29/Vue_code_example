<script>
  import { mapGetters } from 'vuex';
  import { DateTime } from 'luxon';

  export default {
    props: {
      currentDate: DateTime,
    },

    computed: {
      ...mapGetters('scheduling/calendar', ['date']),

      style() {
        return { left: `${(this.currentDate.day * 34) - 35}px` };
      },

      show() {
        const now = this.currentDate;
        return this.date.hasSame(now, 'month') && now.day !== 1;
      },
    },
  };
</script>

<template>
  <div v-if="show" class="calendar-divider" :style="style" />
</template>

<style lang="scss" scoped>
  @import '../../../../../scss/bs-variables';

  .calendar-divider {
    background: red;
    position: absolute;
    left: 100px;
    top: 0;
    height: 100%;
    width: 1px;
  }
</style>
