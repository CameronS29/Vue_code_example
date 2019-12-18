<script>
  export default {
    props: {
      value: {
        type: [Number, String],
        default: null,
      },
      count: {
        type: [Number, String],
        default: null,
      },
    },
  };
</script>

<template>
    <span class="quantity-field_read">
      <span class="quantity-field_read__value">{{ value || '&ndash;' }}</span>
      <span class="quantity-field_read__count" v-if="count !== null">
        | {{ count }} qt
      </span>
    </span>
</template>

<style lang="scss">
  .quantity-field_read {
    &__value { }
    &__count {
      font-size: 0.9em;
      margin-left: 3px;
    }
  }
</style>
