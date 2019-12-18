<script>
  import Filters from './Filters.vue';
  import List from './List.vue';

  export default {
    name: "View",
    components: {
      Filters,
      List,
    },
  };
</script>

<template>
  <div>
    <filters/>
    <list />
  </div>
</template>

<style scoped>

</style>
