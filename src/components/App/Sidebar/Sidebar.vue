<script>
  export default {
    name: 'Sidebar',

    props: {
      show: {
        type: Boolean,
        default: false,
      },
    },

    methods: {
      close() {
        this.$emit('close');
      },
    },

    watch: {
      show(isShown) {
        document.body.style.overflow = (isShown ? 'hidden' : 'auto');
      },
    },
  };
</script>

<template>
  <div class="fltops-sidebar" :class="{'fltops-sidebar_open': show}">
    <div class="fltops-sidebar__sidebar" :class="{'fltops-sidebar__sidebar_open': show}" @touchmove.stop>
      <slot />
    </div>

    <transition name="fltops-sidebar__backdrop-appear" appear>
      <div v-if="show" class="fltops-sidebar__backdrop" @click="close">
        <slot name="backdrop" />
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
  @import '../../../../scss/bs-variables';

  .fltops-sidebar {
    $shadow-offset: 20px;
    $open-duration: 250ms;
    $close-duration: 150ms;

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    position: fixed;
    overflow: hidden;
    visibility: hidden;
    z-index: $sidebar-zindex;

    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;

    &_open {
      visibility: visible;
    }

    &__sidebar {
      position: relative;
      width: 320px;
      height: 100%;
      z-index: $sidebar-zindex + 2;
      overflow-y: auto;

      display: flex;
      flex-flow: column nowrap;

      color: $light-blue;
      background: $black;
      border-right: 1px solid darken($black, 3%);

      box-shadow: 0 0 0 0 transparent;
      transform: translateX(-100%);
      transition: all $close-duration ease-out;
      will-change: transform;

      &::before,
      &::after {
        display: table;
        content: '';
      }

      &_open {
        box-shadow: -$shadow-offset 0 ($shadow-offset * 2) $shadow-offset rgba(0, 0, 0, .7);
        transform: translateX(0);
        transition: all $open-duration ease-in-out;
      }
    }

    &__backdrop {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: $sidebar-zindex + 1;
      background: rgba(0, 0, 0, .2);
    }

    &__backdrop-appear {
      &-enter,
      &-leave-to {
        opacity: 0;
      }

      &-enter-to,
      &-leave {
        opacity: 1;
      }

      &-enter-active {
        transition: all $open-duration ease-in-out;
      }

      &-leave-active {
        transition: all $close-duration ease-out;
      }
    }
  }
</style>
