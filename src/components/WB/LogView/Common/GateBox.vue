<script>
  import { mapGetters } from 'vuex';

  export default {
    computed: mapGetters('wb', ['getCalcValue']),
  };
</script>

<template>
  <div class="panel panel-body col-xs-12 wb-tsa-gate">
    <div class="row wb-tsa__title">
      <div class="col-xs-12">
        <label>Total Gate Checked Bags</label>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12">
        <div class="wb-tsa__value">
          {{ getCalcValue('totals.gate_checked_bags', 0) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../../../../../scss/bs-variables";

  .wb-tsa {
    &__title {
      text-align: center;
    }

    &__value {
      text-align: center;
      font-weight: bold;
      font-size: 60px;
      line-height: 60px;
    }
  }

  @media screen and (max-width: $screen-xs-max) {
    .wb-tsa-gate {
      margin-left: 20px;
      margin-right: 0;
    }
  }
</style>
