<script>
  export default {
    props: {
      value: String,
      disabled: Boolean,
    },
    methods: {
      input(event) {
        this.$emit('input', event.target.value);
      },
    },
  };
</script>

<template>
  <div class="text-area">
    <textarea
      :value="value"
      :disabled="disabled"
      @input="input"
      class="text-area__input"/>
    <slot/>
  </div>
</template>
