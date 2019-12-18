<script>
  import Icon from './Icon.vue';

  const toPx = val => (val && (typeof val !== 'string' ? `${val}px` : val));

  export default {
    name: 'Modal',

    props: {
      show: {
        type: Boolean,
        default: false,
      },

      /**
       * Closes the modal on background click
       */
      backdrop: {
        type: Boolean,
        default: true,
      },

      /**
       * Closes the modal when escape key is pressed
       */
      keyboard: {
        type: Boolean,
        default: true,
      },

      /**
       * Transparent content background
       */
      transparent: {
        type: Boolean,
        default: false,
      },

      /**
       * Whether to show 'x' close icon or not
       */
      showClose: {
        type: Boolean,
        default: true,
      },

      /**
       * Modal content left offset
       */
      x: {
        type: [String, Number],
        default: null,
      },

      /**
       * Modal content top offset
       */
      y: {
        type: [String, Number],
        default: null,
      },

      /**
       * Render modal in absolute mode vs fixed one
       */
      absolute: {
        type: Boolean,
        default: false,
      },

      /**
       * Absolute positioned modal height
       */
      height: {
        type: [String, Number, Boolean],
        default: false,
      },
      /**
       * Use portal or not. "False" is used for injects in legacy
       * or for provide/injects in form validation until
       * https://github.com/LinusBorg/portal-vue/issues/126 will be resolved
       */
      portalled: {
        type: Boolean,
        default: true,
      },
    },

    model: {
      prop: 'show',
      event: 'close',
    },

    components: {
      Icon,
    },

    data() {
      return {
        windowOverflow: null,
      };
    },

    created() {
      this.adjustScroll();
      window.addEventListener('keydown', this.keyboardClose);
    },

    destroyed() {
      if (!this.absolute && this.windowOverflow !== null) {
        document.body.style.overflow = this.windowOverflow;
      }
      window.removeEventListener('keydown', this.keyboardClose);
    },

    methods: {
      close() {
        this.$emit('close');
      },

      backgroundClick(e) {
        if (this.backdrop) {
          this.close();
        }
      },

      adjustScroll() {
        if (!this.absolute && this.show) {
          this.windowOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = this.windowOverflow;
          this.windowOverflow = null;
        }
      },

      keyboardClose(e) {
        if (this.keyboard && this.show && e.code === 'Escape') {
          e.stopPropagation();
          this.close();
        }
      },
    },

    computed: {
      contentClasses() {
        return [
          'modal__content-wrapper',
          { 'modal__content-wrapper_transparent': this.transparent },
        ];
      },
      contentStyles() {
        return {
          position: (this.x || this.y) ? 'absolute' : undefined,
          top: toPx(this.y),
          left: toPx(this.x),
        };
      },
      backgroundClasses() {
        return {
          'modal__background': true,
          'modal__background_absolute': this.absolute,
        };
      },
      backgroundStyles() {
        return {
          height: this.absolute && this.height
            ? toPx(this.height)
            : null
        };
      },
    },

    watch: {
      show: 'adjustScroll',
    },
  };
</script>

<template>
  <portal to="modal" :disabled="!portalled">
    <transition name="modal__transition" appear>
      <div v-if="show" :class="backgroundClasses" :style="backgroundStyles" @click.stop="backgroundClick"
           @touchmove.stop>
        <div :class="contentClasses" :style="contentStyles" @click.stop>
          <slot />
          <div v-if="showClose" class="modal__close" @click="close" title="Close">
            &times;
          </div>
        </div>
      </div>
    </transition>
  </portal>
</template>

<style lang="scss">
  /* Style overrides, no global scope */
  @import "../../../scss/bs-variables";

  /* FixMe: `animation-fill-mode` other than `none` breaks `position: fixed`
            render flow in Chrome */
  .animated {
    -webkit-animation-fill-mode: none !important;
    animation-fill-mode: none !important;
  }

  .el-loading-mask {
    z-index: $modal-splash-zindex;
  }
  .modal__content-wrapper {
    > * {
      position: relative;
    }

    &_transparent {
      > * {
        pointer-events: all;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @import "../../../scss/bs-variables";

  .modal__background {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;

    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 35px;

    will-change: opacity;

    @media screen and (max-width: $screen-xs-max) {
      padding: 20px;
    }

    z-index: $modal-zindex;

    background: rgba(0, 0, 0, 0.5);
    animation-fill-mode: none;

    -webkit-overflow-scrolling: touch;
    overflow-scrolling: touch;

    &_absolute {
      position: absolute;
    }

    .splash__visible-content {
      z-index: $modal-splash-zindex;
    }
  }

  .modal__content-wrapper {
    display: flex;
    margin: auto;
    height: auto;
    position: relative;

    background: #fff;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
    border-radius: 2px;
    cursor: default;

    &_transparent {
      background: transparent;
      box-shadow: none;
      border-radius: 0;
      pointer-events: none;
    }
  }

  .modal__close {
    position: absolute;
    top: -8px;
    right: -30px;

    font-size: 32px;
    cursor: pointer;
    color: white;
    opacity: 0.8;
    line-height: 1;

    &:hover {
      opacity: 1;
    }
  }

  .modal__transition {
    &-enter,
    &-leave-to {
      opacity: 0;
    }

    &-enter-to,
    &-leave {
      opacity: 1;
    }

    &-enter-active {
      transition: opacity 300ms ease-in;
    }

    &-leave-active {
      transition: opacity 300ms ease-out;
    }
  }
</style>
