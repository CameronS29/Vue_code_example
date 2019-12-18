<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';

  import RoutePlanningGantt from './RoutePlanningGantt.vue';

  export default {
    created() {
      this.changeMode(false);
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
  <route-planning-gantt />
</template>
