<script>
  import { mapGetters } from 'vuex';

  export default {
    props: {
      base: {
        type: Object,
        required: true,
      },
      observableDate: {
        type: String,
        required: true,
      },
    },
    computed: {
      ...mapGetters('reports/delay-gantt', [
        'delay',
      ]),
      currentDateDelay() {
        const key = [this.base.title, this.observableDate].join('_');
        return Math.round(this.delay[key]);
      },
      classes() {
        return {
          'delay-gantt-base': true,
          'delay-gantt-base_delayed': this.currentDateDelay,
        };
      },
      styles() {
        const baseHeight = (31 * this.base.levels.length) - 1;
        return { height: `${baseHeight}px` };
      },
    },
  };
</script>

<template>
  <div :class="classes" :style="styles">
    <div class="delay-gantt-base__iata">{{ base.title }}</div>
    <div class="delay-gantt-base__delay" v-if="currentDateDelay">{{ observableDate | ISODateToUS }} delay —
      <strong>{{ currentDateDelay }}</strong> min
    </div>
  </div>
</template>

<style lang="scss">
  .delay-gantt-base {
    display: flex;
    flex-flow: column;
    justify-content: center;
    width: 180px;
    text-align: center;
    font-weight: bold;
    font-size: 12px;
    line-height: 12px;

    &_delayed {
      border-left: 2px solid #ff4264;
    }

    &__iata {
      color: #00403d;
    }

    &__delay {
      font-weight: normal;
    }
  }
</style>
