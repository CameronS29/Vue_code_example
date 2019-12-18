<script>
  import { mapGetters } from 'vuex';

  export default {
    computed: mapGetters('wb', ['getCalcValue']),
  };
</script>

<template>
  <div class="panel panel-body wb-tsa">
    <div class="row wb-tsa__title">
      <div class="col-xs-12">
        <label>Total TSA Checked Bags</label>
      </div>
    </div>
    <div class="row">
      <div class="col-xs-12">
        <div class="wb-tsa__value">
          {{ getCalcValue('totals.tsa_checked_bags', 0) }}
        </div>
      </div>
    </div>
  </div>
</template>
