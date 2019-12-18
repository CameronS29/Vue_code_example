<script>
  export default {
    name: 'ErrorBadge',
    props: {
      title: String,
      type: String,
    },
    computed: {
      classes() {
        return {
          'delay-error-badge__type': true,
          [`delay-error-badge__type_${this.type}`]: true,
        };
      },
    },
  };
</script>

<template>
  <div class="delay-error-badge">
    <div :class="classes" />
    {{ title }}
  </div>
</template>

<style lang="scss">
  @import '../colors';

  .delay-error-badge {
    display: flex;
    align-items: center;
    margin-right: 5px;
    font-size: 12px;
    line-height: 14px;

    &__type {
      height: 10px;
      width: 10px;
      margin-right: 5px;
      border: 1px solid $--border-color-base;

      @each $type, $color in $errors {
        &_#{$type} { background: $color; }
      }
    }
  }
</style>
