<script>
  import Card from 'Common/Card.vue';
  import Graph from '../../Common/Graph.vue';

  export default {
    name: 'Chart',

    props: {
      type: [String, Number],
    },

    components: {
      Card,
      Graph,
    },
  };
</script>

<template>
  <card title="Chart" class="wb-confirm-modal__chart">
    <graph :show-title="false" />
  </card>
</template>

<style lang="scss">
  .wb-confirm-modal__chart {
    width: 0;

    .takeoff__item {
      padding: 0;
      margin-left: 0;
      margin-top: 5px;
    }

    & > .card__container {
      padding: 0;
      .card { margin-bottom: 0; }
    }
  }
</style>
