<script>
  export default {
    props: {
      visible: {
        type: Boolean,
        default: false,
      },
      light: {
        type: Boolean,
        default: false,
      },
    },

    computed: {
      splashClasses() {
        return {
          'splash__visible-content': true,
          'splash__visible-content_dark': !this.light,
          'splash__visible-content_light': this.light,
        };
      },
    },
  };
</script>

<template>
  <div class="splash">
    <div class="splash__content">
      <slot></slot>
    </div>

    <transition name="splash" appear>
      <div v-if="visible" :class="splashClasses">
        <slot name="visible"></slot>
      </div>
    </transition>
  </div>
</template>

<style lang="scss">
  @import "../../../scss/bs-variables";

  .splash {
    position: relative;

    &__visible-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      display: flex;
      align-items: center;
      justify-content: center;

      z-index: $splash-zindex;

      &_dark {
        background-color: rgba(0, 0, 0, 0.3);
        color: #ddd;
      }

      &_light {
        background-color: rgba(255, 255, 255, 0.3);
        color: #333;
      }
    }

    &-enter,
    &-leave-to {
      opacity: 0;
    }

    &-enter-to,
    &-leave {
      opacity: 1;
    }

    &-enter-active {
      transition: opacity 200ms ease-in;
    }

    &-leave-active {
      transition: opacity 200ms ease-out;
    }
  }
</style>
