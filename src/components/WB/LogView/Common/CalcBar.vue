<script>
  export default {
    props: {
      value: Number,
      limit: Number,
      label: String,
    },

    computed: {
      percent() {
        return ((this.value / this.limit) * 100) || 0;
      },

      lineClass() {
        return {
          'wb-calc-bar__progress-inner': true,
          'wb-calc-bar__progress-inner_limit': this.percent > 100,
          'wb-calc-bar__progress-inner_reach': this.percent === 100,
        };
      },
    },
  };
</script>

<template>
  <div class="wb-calc-bar">
    <div class="wb-calc-bar__progress">
      <div v-if="limit"
           role="progressbar"
           :aria-valuenow="percent"
           aria-valuemin="0"
           aria-valuemax="100"
           :style="{ width: (percent > 100 ? 100 : percent) + '%' }"
           :class="lineClass"
      />
    </div>

    <div class="wb-calc-bar__label">
      <strong>{{ label }}:</strong>
      <span class="wb-calc-bar__numbers" :class="{'error': percent > 100}">
        {{ value }} <span v-if="limit" class="wb-calc-bar__limit">/ {{ limit }}</span>
      </span>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../../../../../scss/bs-variables";

  .wb-calc-bar {
    font-size: .9em;

    &__progress {
      display: block;
      background: $--tag-info-fill;
      height: 3px;
      margin-bottom: 3px;
      margin-top: 1px;
    }

    & + & {
      margin-top: 5px;
    }

    &__progress-inner {
      background: $navy;
      height: 100%;
      transition: width 200ms ease, color 200ms ease;

      &_limit {
        background: $red;
      }

      &_reach {
        background: $yellow;
      }
    }

    &__label {
      margin-left: 2px;
    }

    &__numbers {
      display: inline-block;
    }

    &__limit {
      opacity: .6;
      font-size: .8em;
    }
  }
</style>

