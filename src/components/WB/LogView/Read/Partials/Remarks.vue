<script>
  import { mapGetters } from 'vuex';
  import Card from 'Common/Card.vue';

  export default {
    components: { Card },
    computed: mapGetters('wb', ['log']),
  };
</script>

<template>
  <card title="Remarks">
    {{ log.remarks }}
  </card>
</template>
