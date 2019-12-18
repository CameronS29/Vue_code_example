<script>
  import {mapMutations, mapGetters, mapActions} from 'vuex';

  export default {
    computed: {
      ...mapGetters("jobs", ["jobs", "pool", "results"])
    },
    methods: {
      ...mapActions("jobs", [
        "getJobs",
        "getJobsByUUIDs"
      ])
    },
    mounted() {
      setInterval(() => {
        if (this.pool.length) {
          this.getJobsByUUIDs().then(() => {
            this.$store.dispatch("tables/state/getResults");
          });
        }
      }, 2000)
    }
  }
</script>

<template>
  <div>
    <div class="job-list" v-if="results.length > 0">
      <div class="job-list-heading">
        Running jobs
      </div>
      <div class="job" v-for="job in results">
        <div class="title" v-if="job.status !== 'SUCCESS'">Running</div>
        <div class="title" v-else>Completed</div>
        <div class="icon" v-if="job.status !== 'SUCCESS'"><i class="fa fa-spinner fa-inverse fa-spin fa-fw"></i></div>
        <div class="icon" v-else><i class="fa fa-check fa-inverse fa-fw"></i></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .job-list {
    padding: 10px 15px;
    &-heading {
      color: #ddd;
      font-weight: bold;
    }
    .job {
      display: flex;
    }
    .title {
      flex-grow: 1;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.53)
    }
  }
</style>
