<script>
  import { mapGetters } from 'vuex';

  export default {
    computed: {
      ...mapGetters('wb', [
        'selectedAircraftType',
      ]),
    },
  };
</script>

<template>
  <span v-if="selectedAircraftType"> {{ selectedAircraftType.name }} </span>
</template>
