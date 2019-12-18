<script>
  import Icon from '../../Common/Icon.vue';
  import {STATUS_PENDING, STATUS_ACTIVE, STATUS_COMPLETED} from './consts';

  export default {
    props: {
      step: {
        type: [String, Number],
        required: true,
      },

      caption: {
        type: String,
        required: true,
      },

      icon: {
        type: String,
        required: true,
      },
    },

    components: {
      Icon,
    },

    data() {
      return {
        status: STATUS_PENDING,
      };
    },

    computed: {
      isPending() {
        return this.status === STATUS_PENDING;
      },

      isActive() {
        return this.status === STATUS_ACTIVE;
      },

      isCompleted() {
        return this.status === STATUS_COMPLETED;
      },

      circleStyle() {
        return {
          'status-progress__status-item__circle': true,
          'status-progress__status-item__circle_pending': this.isPending,
          'status-progress__status-item__circle_active': this.isActive,
          'status-progress__status-item__circle_completed': this.isCompleted,
        };
      },

      captionStyle() {
        return {
          'status-progress__status-item__caption': true,
          'status-progress__status-item__caption_pending': this.isPending,
          'status-progress__status-item__caption_active': this.isActive,
          'status-progress__status-item__caption_completed': this.isCompleted,
        };
      },
    },

    methods: {
      setStatus(status) {
        this.status = status;
      },
    },
  };
</script>

<template>
  <div class="status-progress__status-item">
    <div :class="circleStyle">
      <transition name="status-badge-confirm">
        <icon
          key="completed"
          class="status-progress__status-item__icon"
          glyph="check"
          size="2x"
          v-if="isCompleted"
        />
        <icon
          key="default"
          class="status-progress__status-item__icon"
          :glyph="icon"
          size="2x"
          v-else
        />
      </transition>
    </div>
    <div :class="captionStyle">
      {{ caption }}
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/variables';
  @import '../../../../scss/bs-variables';

  $item-size: 50px;
  $animation-duration: .5s;

  .status-progress__status-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: auto;

    &__circle {
      width: $item-size;
      height: $item-size;
      position: relative;
      overflow: hidden;

      border-radius: 50%;
      border: 5px solid white;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.36);
      transition: all $animation-duration;

      &_pending {
        background-color: $inactive-bar;
        color: rgba(255, 255, 255, .6);
      }

      &_active {
        background-color: $black;
        color: white;
      }

      &_completed {
        background-color: $navy;
        color: white;
      }
    }

    &__icon {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      margin: auto;

      line-height: $item-size;
      text-align: center;
    }

    &__caption {
      font-weight: bold;
      font-size: 14px;
      transition: color $animation-duration;
      text-align: center;
      padding: 3px 5px;

      @media screen and (max-width: $screen-xs-max) {
        font-size: 12px;
      }

      @media screen and (max-width: 375px) {
        display: none;

        &_active {
          display: block;
        }
      }

      &_pending {
        color: $inactive-bar;
      }
      &_active {
        color: $black;
      }
      &_completed {
        color: $navy;
      }
    }
  }

  .status-badge-confirm {
    &-enter-active, &-leave-active {
      transition: all $animation-duration;
    }

    &-enter {
      transform: translateY(100%);
      opacity: 0;
    }

    &-enter-to, &-leave {
      transform: translateY(0);
      opacity: 1;
    }

    &-leave-to {
      transform: translateY(-100%);
      opacity: 0;
    }
  }
</style>
