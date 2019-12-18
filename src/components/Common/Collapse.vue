<script>
  export default {
    props: {
      title: String,
      gutterColor: {
        type: [String, Boolean],
        default: '#1ab394',
      },
      collapsed: {
        type: Boolean,
        default: false,
      },
      controlled: {
        type: Boolean,
        default: false,
      },
      padding: {
        type: String,
        default: '20px',
      },
    },

    model: {
      prop: 'collapsed',
      event: 'collapse',
    },

    data() {
      return {
        internalCollapsed: this.collapsed,
      };
    },

    computed: {
      gutterStyle() {
        return {
          borderBottom: this.gutterColor
            ? `4px solid ${this.gutterColor}`
            : '1px solid #e7eaec',
        };
      },

      chevronClasses() {
        return {
          fa: true,
          'fa-chevron-up': !this.isCollapsed,
          'fa-chevron-down': this.isCollapsed,
        };
      },

      isCollapsed() {
        return this.controlled
          ? this.collapsed
          : this.internalCollapsed;
      },
    },

    methods: {
      collapse() {
        this.internalCollapsed = !this.isCollapsed;
        this.$emit('collapse', !this.isCollapsed);
      },
    },
  };
</script>

<template>
  <div class="collapse-el">
    <div class="collapse-el__head" :style="gutterStyle">
      <div class="collapse-el__title-wrapper">
        <slot name="title">
          <span class="collapse-el__title">{{ title }}</span>
        </slot>
      </div>
      <div class="collapse-el__tools">
        <a class="collapse-el__chevron" @click="collapse">
          <i :class="chevronClasses"></i>
        </a>
      </div>
    </div>
    <transition name="collapse-el_transition">
      <div class="collapse-el__content" v-show="!isCollapsed" :style="{ padding }">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<style lang="scss">
  .collapse-el {
    margin-bottom: 10px;

    &__head {
      background-color: #fff;
      border-color: #e7eaec;
      border-style: solid solid none;
      border-width: 2px 0 0;
      margin-bottom: 0;
      padding: 15px 15px 7px;
      min-height: 48px;
    }

    &__title-wrapper {
      display: inline-block;
      margin: 0 0 7px;
      padding: 0;
      float: left;
    }

    &__title {
      font-size: 14px;
      text-overflow: ellipsis;
      font-weight: 600;
    }

    &__tools {
      display: block;
      float: none;
      margin-top: 0;
      padding: 0;
      text-align: right;
    }

    &__chevron {
      $chevron-color: #c4c4c4;
      cursor: pointer;
      margin-left: 5px;
      color: $chevron-color;

      &:hover {
        color: darken($chevron-color, 5%);
      }
    }

    &__content {
      clear: both;
      background-color: #fff;
      border-bottom: 2px solid #e7eaec;
    }

    &_transition {
      &-enter,
      &-leave-to {
        transform: scaleY(0);
        transform-origin: top;
      }

      &-enter-to,
      &-leave {
        transform: scaleY(1);
        transform-origin: top;
      }

      &-enter-active {
        transition: transform 400ms ease-out;
      }

      &-leave-active {
        transition: transform 400ms ease-in;
      }
    }
  }
</style>
