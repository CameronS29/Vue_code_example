<script>
  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      classes() {
        return {
          'right-bar': true,
          'right-bar_active': this.show,
        };
      },
    },
  };
</script>

<template>
  <div>
    <div :class="classes"v-if="show">
      <a href="#" class="right-bar__close" @click="$emit('hide')">
        <i class="fa fa-times" aria-hidden="true" />
      </a>
      <slot />
    </div>
  </div>

</template>

<style lang="scss" scoped>
  .right-bar {
    background: #fff;
    position: fixed;
    right: 0;
    min-width: 300px;
    z-index: 1109;
    display: none;
    top: 0;
    height: 100%;
    box-shadow: rgba(156, 156, 156, 0.22) -1px 0 10px;
    &__close {
      border-radius: 3px;
      display: block;
      content: '';
      height: 30px;
      width: 20px;
      background: #fff;
      box-shadow: -3px 3px 6px rgba(156, 156, 156, 0.11);
      position: absolute;
      top: 0;
      left: -17px;
      text-align: center;
      padding-top: 3px;
      i {
        color: #000;
      }
    }
  }

  .right-bar_active {
    display: block;
  }
</style>
