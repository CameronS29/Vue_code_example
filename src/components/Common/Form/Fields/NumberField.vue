<script>
  import {mapGetters, mapActions} from 'vuex';

  export default {
    props: [
      "value",
      "placeholder",
      "max",
      "min",
      "step",
      "disabled"
    ],
    methods: {
      input(event) {
        this.$emit("input", event.target.value);
      }
    },
    computed() {
    }
  }
</script>

<template>
  <div class="text-field">
    <input :max="max" :min="min" :step="step" :disabled="!!disabled"
      :placeholder="placeholder" :value="value" @input="input" class="text-field__input" type="number">
    <slot></slot>
  </div>
</template>
