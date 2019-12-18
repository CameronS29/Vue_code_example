<script>
import { throttle, isString } from 'lodash';

export default {
  props: {
    component: {
      type: [Object, String],
      default: 'input',
    },
    value: String,
    delay: {
      type: Number,
      default: 300,
    },
  },

  data() {
    return {
      innerValue: this.value,
    };
  },

  created() {
    this.makeThrottle();
  },

  methods: {
    innerInputHandler(e) {
      this.innerValue = isString(this.component)
        ? e.target.value
        : e;
    },

    makeThrottle() {
      this.throttledInput = throttle(
        () => this.$emit('input', this.innerValue),
        this.delay,
        { leading: false, trailing: true },
      );
    },
  },

  watch: {
    value(value) {
      this.innerValue = value;
    },

    innerValue() {
      this.throttledInput();
    },

    delay() {
      this.makeThrottle();
    },
  },
};
</script>

<template>
  <component
    :is="component"
    v-bind="$attrs"
    :value="value"
    @input="innerInputHandler"
  />
</template>
