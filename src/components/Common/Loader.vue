<script>
  export default {
    props: {
      loaded: {
        default: true
      },
      size: {
        type: String,
        default: '3x',
      },
      type: {
        type: String,
        default: 'circle-o-notch',
      },
      animation: {
        type: String,
        default: 'spin',
      },
      element: {
        type: [String, Object],
        default: 'span',
      },
    },

    computed: {
      classes() {
        return [`fa-${this.size}`, `fa-${this.type}`, `fa-${this.animation}`];
      },
    },
  };
</script>

<template>
  <transition name="loader" mode="out-in" appear>
    <component v-if="loaded" :is="element" key="loaded">
      <slot></slot>
    </component>
    <component v-else :is="element" key="loading" class="loader">
      <i class="loader__spinner fa fa-spin fa-fw" :class="classes"></i>
      <span class="loader__text sr-only">Loading...</span>
    </component>
  </transition>
</template>

<style>
  .loader-enter,
  .loader-leave-to {
    opacity: 0;
  }

  .loader-enter-to,
  .loader-leave {
    opacity: 1;
  }

  .loader-enter-active {
    transition: opacity 150ms ease-in;
  }

  .loader-leave-active {
    transition: opacity 150ms ease-out;
  }
</style>
