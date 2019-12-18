<script>
  import { mapActions } from 'vuex';

  export default {
    created() {
      this.getAircrafts();
    },

    methods: mapActions('aircraft', ['getAircrafts']),
  };
</script>


<template>
  <router-view></router-view>
</template>
