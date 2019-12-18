<script>
  /**
   * This is a fast one-time solution to sync in background.
   * TODO: replace with good-designed reusable solution.
   * FIXME
   */
  import axios from 'axios';
  import DiffPopup from 'components/Dispatch/Inspections/Partials/DiffPopup.vue';
  import ViewPortal from 'Common/ViewPortal.vue';

  export default {
    props: ['aircraft'],
    components: {
      DiffPopup,
      ViewPortal,
    },
    data() {
      return {
        running: false,
        original: null,
        change: null,
      };
    },
    methods: {
      track(uid) {
        axios.get(`/api/job/${uid}/`)
          .then((response) => {
            if (response.data.status === 'SUCCESS' || response.data.status === 'FAILURE') {
              this.running = false;
              this.$emit('done');
            } else {
              setTimeout(() => { this.track(uid); }, 2000);
            }
          });
      },
      async sync() {
        this.running = true;
        this.change = null;
        this.original = null;
        const { data } = await axios.post(`/dispatch/api/aircraft/${this.aircraft}/docpush/`);
        this.track(data.uid);
      },
      cancel() {
        this.change = null;
        this.original = null;
        this.running = false;
      },
      async preSync() {
        this.running = true;
        const { data } = await axios.get(`/dispatch/api/aircraft/${this.aircraft}/docpush/`);
        const { original, change } = data;
        this.original = original;
        this.change = change;
      },
    },
  };
</script>

<template>
  <div>
    <view-portal to="header">
      <diff-popup
        :original="original"
        :change="change"
        v-if="original && change"
        @accept="sync"
        @decline="cancel"
      />
    </view-portal>
    <el-button type="primary" size="small" @click="preSync">
      <span v-if="!running">Push</span>
      <span v-if="running"><i class="el-icon-loading"/>Pushing</span>
    </el-button>
  </div>
</template>
