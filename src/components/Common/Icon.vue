<script>
  export default {
    props: {
      glyph: {
        type: String,
        required: true,
      },

      size: {
        type: String,
        default: null,
      },

      spin: {
        type: Boolean,
        default: false,
      },

      fixedWidth: {
        type: Boolean,
        default: false,
      },
    },

    computed: {
      iconSize() {
        return {[`fa-${this.size}`]: this.size};
      },

      isSpinning() {
        return {'fa-spin': this.spin};
      },

      isFixed() {
        return {'fa-fw': this.fixedWidth};
      },
    },
  };
</script>

<template>
  <span @click="$emit('click')">
    <i :class="['fa', `fa-${glyph}`, iconSize, isSpinning, isFixed]"></i>
  </span>
</template>
