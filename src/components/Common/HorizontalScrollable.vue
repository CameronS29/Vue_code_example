<script>
  export default {
    props: {
      fadeColor: {
        type: String,
        default: '#fff',
      },
      hideScrollbar: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        offsetWidth: 0,
        scrollLeft: 0,
        scrollWidth: 0,
      };
    },
    mounted() {
      this.refreshScrollProps();

      this.$refs.content.addEventListener('scroll', (e) => {
        this.refreshScrollProps();
      });
    },
    computed: {
      classes() {
        const { offsetWidth, scrollLeft, scrollWidth } = this;

        return {
          'horizontal-scrollable': true,
          'horizontal-scrollable_left': scrollLeft !== 0,
          'horizontal-scrollable_right': offsetWidth + scrollLeft !== scrollWidth,
        };
      },
      wrapperClass() {
        return {
          'horizontal-scrollable__wrapper': true,
          'horizontal-scrollable__wrapper_hidden-scrollbar': this.hideScrollbar,
        };
      },
    },
    methods: {
      refreshScrollProps() {
        const content = this.$refs.content;

        this.offsetWidth = content.offsetWidth;
        this.scrollLeft = content.scrollLeft;
        this.scrollWidth = content.scrollWidth;
      },
    },
  };
</script>

<template>
  <div :class="classes" :style="{'--fade-color': fadeColor}">
    <div class="horizontal-scrollable__content">
      <div ref="content" :class="wrapperClass">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .horizontal-scrollable {
    position: relative;

    &__wrapper {
      overflow-x: auto;

      &_hidden-scrollbar {
        &::-webkit-scrollbar {
          display: none;
        }
      }
    }

    &__content {
      overflow: hidden;

      &:before, &:after {
        content: '';
        opacity: 0;
        display: block;
        position: absolute;
        top: 0;
        width: 50px;
        height: 100%;
        pointer-events: none;
        z-index: 90;
        transition: .3s;
      }
      &:before {
        background: linear-gradient(to right, var(--fade-color) 0%, transparent 100%);
        left: 0;
      }
      &:after {
        background: linear-gradient(to left, var(--fade-color) 0%, transparent 100%);
        right: 0;
      }
    }

    &_left {
      .horizontal-scrollable__content {
        &:before {
          opacity: 1;
        }
      }
    }
    &_right {
      .horizontal-scrollable__content {
        &:after {
          opacity: 1;
        }
      }
    }
  }
</style>
