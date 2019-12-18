<script>
  import {mapGetters, mapActions} from 'vuex';

  export default {
    props: ["highlight"]
  }
</script>

<template>
  <div class="group-split" :class="{'group-split_highlight': highlight}">
    <slot></slot>
  </div>
</template>

<style lang="scss">
  .group-split {
    display: flex;
    &_highlight {
      background: #fbfbfb;
      padding-top: 10px;
      margin-bottom: 10px;
    }
    .btq-form__group {
      flex-grow: 1;
    }
  }
</style>
