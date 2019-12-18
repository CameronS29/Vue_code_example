<script>
  import { mapActions, mapGetters } from 'vuex';
  import { Button } from 'element-ui';

  export default {
    props: {
      type: [String, Number],
    },

    components: {
      ButtonEl: Button,
    },

    data() {
      return {
        pending: false,
      };
    },

    computed: mapGetters('wb', ['log']),

    methods: {
      ...mapActions('wb', ['pushWBLog', 'reset']),

      async create() {
        this.pending = true;
        this.reset();

        try {
          await this.pushWBLog();
          this.$router.push({
            name: 'wb_log',
            params: { id: this.log.id },
          });
        } catch (e) {
          this.$notify({
            type: 'error',
            title: 'Cannot create new log',
            message: 'Check your network connection or try again later',
          });
          console.error(e);
        } finally {
          this.pending = false;
        }
      },
    },
  };
</script>

<template>
  <button-el type="primary"
             icon="el-icon-plus"
             @click="create"
             :loading="pending"
             size="small"
             round>
    Weight & Balance Log
  </button-el>
</template>
