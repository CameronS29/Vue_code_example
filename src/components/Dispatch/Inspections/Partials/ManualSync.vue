<script>
  /**
   * This is a fast one-time solution to sync in background.
   * TODO: replace with good-designed reusable solution.
   * FIXME
   */
  import {mapGetters, mapActions} from 'vuex';
  import axios from "axios";

  export default {
    props: ['aircraft'],
    data() {
      return {
        running: false,
      }
    },
    methods: {
      track(uid) {
        axios.get(`/api/job/${uid}/`)
          .then(response => {
            if (response.data.status === "SUCCESS" || response.data.status === "FAILURE") {
              this.running = false;
              this.$emit("done");
            } else {
              setTimeout(() => {this.track(uid)}, 2000);
            }
          })
      },
      sync() {
        this.running = true;
        axios.post(`/dispatch/api/aircraft/${this.aircraft}/sync/`).then(({data}) => this.track(data.uid));
      }
    }
  }
</script>

<template>
  <el-button type="primary" size="small" @click="sync">
    <span v-if="!running">Sync</span>
    <span v-if="running"><i class="el-icon-loading"></i></span>
  </el-button>
</template>
