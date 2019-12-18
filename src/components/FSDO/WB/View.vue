<script>

  import Promise from 'bluebird';
  import { mapActions, mapGetters } from 'vuex';
  import LogRead from '../../WB/LogView/Read/View.vue';
  import LogLoading from '../../WB/LogView/LogLoading.vue';
  import LogNotFound from '../../WB/LogView/NotFound/View.vue';

  export default {
    props: ['id'],
    components: {
      LogRead,
      LogLoading,
      LogNotFound
    },
    created() {
      this.getLogData();
    },
    methods: {
      ...mapActions('wb', [
        'reset',
        'getWBLog',
        'getAllOptions',
      ]),

      getLogData() {
        this.notFound = false;
        this.reset();

        Promise.join(
          this.getAllOptions(),
          this.getWBLog(this.id),
        ).catch(() => { this.notFound = true; });
      },
    },

    computed: {
      ...mapGetters('wb', [
        'selectedAircraftType',
        'log',
      ]),
      logComponent() {
        if (this.notFound) {
          return 'LogNotFound';
        }

        if (this.log.id) {
          return 'LogRead';
        }

        return 'LogLoading';
      },
    }
  }
</script>

<template>
  <component :is="logComponent" :id="Number(id)" :hideButtons="true" />
</template>
