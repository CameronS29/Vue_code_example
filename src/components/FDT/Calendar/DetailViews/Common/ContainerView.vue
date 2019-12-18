<script>
  export default {
    props: {
      title: String,
    },
  };
</script>

<template>
  <div class="sidebar">
    <div class="sidebar__block sidebar__block-heading">
      <div
        class="sidebar__title"
        :class="{'sidebar__title_single': !$slots.subtitle }"
      >
        {{ title }}
        <slot name="icons"></slot>
      </div>
      <div class="sidebar__subtitle">
        <slot name="subtitle"></slot>
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<style lang="scss">
  @import '../../scss/variables';

  .sidebar {
    border-radius: 2px;
    margin-top: 10px;
    padding: 5px 20px 20px;
    background: white;

    &::after {
      display: block;
      content: '';
      clear: both;
    }

    &__block {
      margin-bottom: 20px;

      &-heading {
        font-size: 1.2em;
      }
    }

    &__title {
      font-weight: bold;

      &_single {
        padding-bottom: 4px;
        border-bottom: $border-base;
      }
    }

    &__subtitle {
      font-size: 1.1em;
      font-weight: bold;
    }
  }
</style>
