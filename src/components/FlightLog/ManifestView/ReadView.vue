<script>

  import Promise from 'bluebird';
  import { mapActions, mapGetters } from 'vuex';
  import ManifestRead from './Read/View.vue';


  export default {
    props: ['id'],
    components: {
      ManifestRead,
    },
  }
</script>

<template>
  <manifest-read
    :id="Number(id)"
    :hideButtons="true"
    :backUrl="{ name: 'pilot_dashboard' }"
  />
</template>
