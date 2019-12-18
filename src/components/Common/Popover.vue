<script>
  import { fireEvent } from 'utils/DOM';

  export default {
    props: {
      elementProps: {
        type: Object,
        default: () => ({}),
      },
      placeholderClass: {
        type: String,
        default: 'popover-ref',
      },
    },
    async mounted() {
      await this.$nextTick();

      fireEvent(this.$refs.reference, 'click');
    },
    data() {
      return {
        defaultElementProps: {
          trigger: 'click',
          placement: 'bottom',
        },
      };
    },
  };
</script>

<template>
  <el-popover
    @after-leave="$emit('hide')"
    popper-class="common-popover"
    v-bind="Object.assign(defaultElementProps, elementProps)">
    <slot />
    <div :class="placeholderClass" ref="reference" slot="reference" />
  </el-popover>
</template>

<style lang="scss">
  .common-popover {
    min-width: auto;
  }
</style>
