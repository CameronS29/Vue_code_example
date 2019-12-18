<script>
  export default {
    props: {
      as: {
        type: [String, Object],
        default: 'el-button',
      },

      type: {
        type: String,
        default: 'primary',
      },
    },
  };
</script>

<template>
  <component :is="as"
             v-bind="$attrs"
             :type="type"
             class="LogButton"
             @click="$emit('click')">
    <slot></slot>
  </component>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .LogButton {
    margin: 10px 0 0 0;

    @media screen and (max-width: $screen-xs-max) {
      padding: 10px;
      margin: 10px 0;
      width: 100%;
      display: block;

      & + & {
        margin-left: 0;
      }
    }
  }
</style>
