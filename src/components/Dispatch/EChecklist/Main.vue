<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

  import RoutePlanningGantt from '../../RoutePlanningGantt/RoutePlanningGantt.vue';

  export default {
    created() {
      this.changeMode(true);
    },
    components: {
      RoutePlanningGantt,
    },
    methods: {
      ...mapActions('routeplanningGantt', ['changeMode']),
    },
  };
</script>

<template>
  <route-planning-gantt class="e-checklist" />
</template>

<style lang="scss">
  .e-checklist {

  }
</style>
