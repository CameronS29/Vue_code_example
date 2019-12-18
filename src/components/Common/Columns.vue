<script>
  /**
   * Provides multiple columns environment
   */
  export default {
    props: {
      /**
       * Number of columns. Default: 2
       */
      cols: {
        type: Number,
        default: 2
      }
    }
  }
</script>

<template>
  <div :class="'column-flex column-flex_cols-' + cols">
    <slot></slot>
  </div>
</template>

<style lang="scss">
  .column-flex {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;

    @for $i from 2 through 12 {
      &_cols-#{$i} {
        .column-flex__column {
          flex-basis: calc((100% / #{$i}) - 10px);
          flex-grow: 0;
          flex-shrink: 0;
          &_shrink {
            flex-shrink: 1;
          }
          &_grow {
            flex-grow: 1;
          }
        }
      }
    }
  }
</style>
