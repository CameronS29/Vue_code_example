<script src="../../../routers/routeplanning.js"></script>
<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

  import ViewPortal from 'Common/ViewPortal.vue';
  import LineEl from './Line.vue';

  export default {
    async created() {
      if (!this.lines.length) {
        await this.getLines();
      }
      if (!this.flights.length) {
        await this.fetchFlights();
      }
    },
    components: {
      ViewPortal,
      LineEl,
    },
    computed: {
      ...mapState('routeplanningGantt/lines', [
        'lines',
        'flights',
      ]),
      ...mapGetters('routeplanningGantt/lines', [
        'sortedLines',
      ]),
    },
    methods: {
      ...mapActions('routeplanningGantt/lines', [
        'getLines',
        'addLine',
        'fetchFlights',
      ]),
      async handleAddNewClick() {
        const { value: name } = await this.$prompt('Please input line name', 'Tip', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          inputPattern: /\w/,
          inputErrorMessage: 'Name can\'t be empty',
        });

        this.addLine(name);
      },
    },
  };
</script>

<template>
  <main class="flight-numbers-lines">
    <view-portal min-width="1000px" to="header">
      <el-button size="small" type="primary" icon="fa fa-fw fa-plus" @click="handleAddNewClick">Add new</el-button>
    </view-portal>

    <line-el :line="line" :key="line.id" v-for="line in sortedLines" />
  </main>
</template>

<style lang="scss">
  .flight-numbers-lines {

  }
</style>
