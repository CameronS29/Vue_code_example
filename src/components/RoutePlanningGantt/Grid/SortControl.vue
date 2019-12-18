<script>
  export default {
    props: {
      value: {
        type: Number,
        required: true,
      },
    },
    methods: {
      handleClick() {
        this.$emit('click');
      },
    },
  };
</script>

<template>
  <i v-if="value === 1" class="fa fa-sort-amount-asc sort-control" @click="handleClick" />
  <i v-else-if="value === -1" class="fa fa-sort-amount-desc sort-control" @click="handleClick" />
  <i v-else class="fa fa-sort sort-control" @click="handleClick" />
</template>

<style lang="scss">
  .sort-control {
    cursor: pointer;
  }
</style>
