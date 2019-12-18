<script>
  import {mapGetters, mapActions} from 'vuex';

  export default {
    props: ["value", "placeholder", "type", "disabled"],
    methods: {
      input(event) {
        this.$emit("input", event.target.value);
      }
    },
  }
</script>

<template>
  <div class="text-field">
    <input :placeholder="placeholder" :disabled="disabled" :value="value" @input="input" class="text-field__input" :type="type">
    <slot></slot>
  </div>
</template>
