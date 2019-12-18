<script>
  import {clamp} from 'lodash';

  export default {
    name: 'Progress',

    props: {
      value: {
        type: Number,
        default: 0,
      },

      max: {
        type: Number,
        required: true,
      },

      label: String,
      postfix: String,
      separator: {
        type: String,
        default: '/',
      },
    },

    computed: {
      progressStyles() {
        const ratio = clamp(this.value / this.max, 0, 1);
        return {width: `${ratio * 100}%`}
      },

      progressClasses() {
        return {
          'fdt-totals-progress__progress': true,
          'fdt-totals-progress__progress_invalid': this.value > this.max,
        };
      },

      caption() {
        const {label, value} = this;
        return label !== undefined ? `${label}: ${value}` : value;
      },
    },
  };
</script>

<template>
  <div class="fdt-totals-progress">
    <h4 v-if="label !== undefined" class="fdt-totals-progress__label">
      {{ caption }} {{ postfix }}
      <span class="fdt-totals-progress__max">
        {{ separator }} {{ max }}
      </span>
    </h4>
    <div class="fdt-totals-progress__bar">
      <div :class="progressClasses" :style="progressStyles"/>
    </div>
  </div>
</template>

<style lang="scss">
  .fdt-totals-progress {
    &__label {
      font-size: 12px;
      margin: 3px;
    }

    &__max {
      opacity: .5;
    }

    &__bar {
      height: 4px;
      background: #ddd;
    }

    &__progress {
      background: #53B095;
      height: 100%;

      &_invalid {
        background: #ED5565;
      }
    }

    h4 {
      padding: 5px 0 0 7px;
    }
  }
</style>
