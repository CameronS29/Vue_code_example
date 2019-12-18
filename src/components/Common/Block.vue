<script>
  export default {
    props: {
      title: String,
      noPadding: {
        type: Boolean,
        default: false
      },
    },
  };
</script>

<template>
  <div class="block">
    <div class="block__title">
      <div class="block__title-text" v-if="title">{{ title }}</div>
      <slot name="title" />
    </div>
    <div
      class="block__contents"
      :class="{'block__contents_no-padding': noPadding !== false}"
    >
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
  .block {
    background: #fff;
    border-radius: 3px;
    margin-bottom: 15px;

    &__title {
      padding: 10px 20px;
      font-size: 13px;
      font-weight: bold;
      background: #FBFBFB;
      border-bottom: 3px solid #2B6AE9;
      display: flex;
      align-items: center;
    }

    &__title-text {
      flex-grow: 1;
    }

    &__contents {
      padding: 15px 20px;
      &_no-padding {
        padding: 15px 0;
      }
    }

    &::before, &::after {
      display: table;
      content: '';
      clear: both;
    }
  }
</style>
