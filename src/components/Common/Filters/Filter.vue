<script>
  export default {
    props: {
      label: String,
    },
  };
</script>

<template>
  <div class="typed-filter">
    <span
      v-if="label"
      class="typed-filter__label">{{ label }}</span>
    <slot />
    <el-button
      class="typed-filter__delete-btn"
      type="danger"
      size="mini"
      icon="el-icon-delete"
      @click="$emit('delete')" />
  </div>
</template>

<style lang="scss">
  .typed-filter {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    margin-right: 20px;
    &__label {
      margin-right: 10px;
    }
    &__delete-btn {
      margin-left: 10px;
      padding-left: 10px;
      padding-right: 10px;
    }
  }
</style>
