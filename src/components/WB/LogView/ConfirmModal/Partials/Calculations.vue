<script>
  import Card from 'Common/Card.vue';
  import CalcTable from '../../Common/CalcTable.vue';

  export default {
    name: 'Calculations',

    components: {
      Card,
      CalcTable,
    },
  };
</script>

<template>
  <card title="Calculations" class="wb-confirm-modal__calc-table">
    <calc-table />
  </card>
</template>

<style lang="scss">
  .wb-confirm-modal__calc-table {
    width: 100%;
    position: relative;

    .card__heading {
      padding-bottom: 0;
    }

    .table > tbody > tr > td {
      padding: 5px 8px;
    }

    .calc-table {
      font-size: 0.95em;
    }
  }
</style>
