<script>
  import Vue from 'vue';
  import { Portal } from 'portal-vue';

  export const PopperDispatch = new Vue({
    data: { poppers: [] },

    computed: {
      placeholderHeight() {
        const heights = this.poppers
          .filter(el => el.show)
          .map(el => el.maxHeight);
        return Math.max(heights.reduce((t, h) => Math.max(parseInt(h, 10), t), 0));
      },
    },

    methods: {
      addPopper(el) {
        this.poppers.push(el);
      },

      removePopper(el) {
        const idx = this.poppers.indexOf(el);
        if (idx !== -1) {
          this.poppers.splice(idx, 1);
        }
      },
    },
  });

  export default {
    name: 'BottomPopper',
    components: { Portal },

    props: {
      show: {
        type: Boolean,
        required: true,
      },

      title: {
        type: String,
        required: false,
      },

      maxHeight: {
        type: String,
        default: '350px',
      },

      headerHeight: {
        type: String,
        default: '60px',
      },
    },

    model: {
      prop: 'show',
      event: 'close',
    },

    data() {
      return { isSmallHeader: 0 };
    },

    created() {
      window.addEventListener('keydown', this.keyboardClose);
    },

    mounted() {
      PopperDispatch.addPopper(this);
    },

    destroyed() {
      PopperDispatch.removePopper(this);
      window.removeEventListener('keydown', this.keyboardClose);
    },

    computed: {
      headerClasses() {
        return {
          'bottom-popper__header': true,
          'bottom-popper__header_small': !!this.isSmallHeader,
          'header-small': !!this.isSmallHeader,
        };
      },

      contentStyles() {
        const transform = `calc(${this.headerHeight} * 0.8)`;
        return {
          maxHeight: this.maxHeight,
          top: this.isSmallHeader ? transform : this.headerHeight,
          paddingBottom: transform,
        };
      },
    },

    methods: {
      handleCloseClick() {
        this.$emit('close');
      },

      handleScroll({ target }) {
        this.isSmallHeader = target.scrollTop > 20;
      },

      keyboardClose(e) {
        if (e.code === 'Escape') {
          e.stopPropagation();
          this.handleCloseClick();
        }
      },
    },
  };
</script>

<template>
  <transition name="bottom-popper_fade">
    <div class="bottom-popper" v-if="show" @keydown.esc="handleCloseClick">
      <header ref="header" :class="headerClasses" :style="{height: headerHeight}">
        <div class="bottom-popper__header-content">
          <slot name="header">{{ title }}</slot>
        </div>

        <span class="bottom-popper__close" @click="handleCloseClick" title="Close">&times;</span>

        <div class="bottom-popper__separator">
          <slot name="separator">
            <div class="bottom-popper__separator-line"/>
          </slot>
        </div>
      </header>

      <section class="bottom-popper__content" :style="contentStyles" @scroll="handleScroll">
        <slot />
      </section>
    </div>
  </transition>
</template>

<style lang="scss">
  @import '../../../scss/bs-variables';
  $side-margin: 30px;
  $content-height: 350px;
  $popper-z-index: 100;

  $transform-transition: transform 150ms ease;
  $top-transition: top 150ms ease;


  .bottom-popper {
    $popper-bg: #fff;

    position: fixed;
    width: 100%;
    overflow-y: hidden;

    bottom: 0;
    left: 0;
    right: 0;
    background: $popper-bg;
    color: $text-color;
    padding: 0 $side-margin;
    border-top: 1px solid rgba(0, 0, 0, .1);
    box-shadow: 0 0 10px rgba(0, 0, 0, .1);
    z-index: $popper-z-index;
    will-change: transform, opacity;

    &_fade-enter-active, &_fade-leave-active {
      transition: .2s ease-out;
    }
    &_fade-enter, &_fade-leave-to {
      opacity: 0;
      transform: translate3d(0, 100px, 0);
    }

    $header-padding: 5px;

    &__header {
      font-size: 22px;
      line-height: 22px;
      font-weight: bold;
      background: $popper-bg;
      position: absolute;
      display: flex;
      flex-flow: column;

      top: 0;
      left: 0;
      right: 0;
      z-index: $popper-z-index;
      padding: 0 $side-margin;
    }

    &__header {
      transition: $transform-transition;
      transform-origin: top left;
      will-change: transform;

      &_small {
        transform: scaleY(0.8);

        .bottom-popper__header-content {
          transform: scaleX(0.8);
        }

        .bottom-popper__close {
          transform: scaleY(1.25) translateY(-5px);
        }

        .bottom-popper__separator {
          transform: scaleY(1.25);
        }
      }
    }

    &__header-content {
      transition: $transform-transition;
      transform-origin: top left;
      will-change: transform;

      margin: auto 0;
      display: flex;
      align-items: center;
    }

    &__separator {
      transform-origin: bottom center;
      transition: $transform-transition;
      will-change: transform;
    }

    &__separator-line {
      margin: 0 (-$side-margin);
      border-bottom: 1px solid #f4f4f4;
    }

    &__content {
      overflow-y: auto;
      position: relative;
      z-index: $popper-z-index;
      transition: $top-transition;
      will-change: top, padding-bottom;

      &::before, &::after {
        display: table;
        content: '';
        clear: both;
      }
    }

    &__close {
      position: absolute;
      top: 0;
      bottom: 0;
      right: $side-margin;
      height: 30px;
      width: 30px;
      margin: auto;

      font-size: 20px;
      line-height: 30px;
      font-weight: bold;
      text-align: center;
      color: #7f8584;
      cursor: pointer;

      transform-origin: top right;
      transition: $transform-transition;
    }
  }
</style>
