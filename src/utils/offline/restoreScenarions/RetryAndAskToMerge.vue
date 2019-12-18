<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { sortBy, last } from 'lodash';

  import Badge from 'Common/Badge.vue';

  export default {
    name: 'offline-notification',
    components: {
      Badge,
    },
    async created() {
      await this.syncRecords();

      if (this.apiKeysRelatedRecords.length) {
        this.$emit('sync-offline', last(sortBy(this.apiKeysRelatedRecords)).state);
        await this.retryRequestsIfNeeds();
      }
    },
    data() {
      return { hidden: false };
    },
    props: {
      entityName: {
        type: String,
        default: 'Entity'
      },
      autoRetry: {
        type: Boolean,
        default: false
      },
      apiKeys: {
        type: Array,
        default: () => []
      },
      reduceResponses: {
        type: [Function, Boolean],
        default: Boolean
      },
    },
    computed: {
      ...mapState('offline', [
        'onlineStatus',
        'recentSuccessSyncs',
        'records',
        'retryingRequests',
        'lastReqConflictsDetected',
      ]),
      classes() {
        return {
          'offline-notification': true,
          'offline-notification_error': !this.onlineStatus && this.apiKeysRelatedRecords.length,
        };
      },
      header() {
        if (!this.onlineStatus) return 'You’re editing in offline mode';
        if (this.apiKeysRelatedRecentSuccessSyncs.length && !this.apiKeysRelatedRecords.length) {
          return `${this.entityName} was successfully saved`;
        }
        if (this.onlineStatus && this.retryingRequests) return 'Connection was restored';
        if (this.onlineStatus && this.lastReqConflictsDetected) {
          return 'Connection was restored. Conflicts detected';
        }
      },
      message() {
        if (this.onlineStatus && this.retryingRequests) return 'Retrying...';
        if (this.apiKeysRelatedRecentSuccessSyncs.length && !this.apiKeysRelatedRecords.length) {
          return 'Your changes are in sync with FLTOPS application';
        }
        if (this.onlineStatus && this.lastReqConflictsDetected) {
          return `This ${this.entityName} was edited after your save attempt`;
        }

        return `Now you have ${this.apiKeysRelatedRecords.length} uncommitted changes. Your changes are safely
        stored in browser and will be synced as soon as connection will be proceed`;
      },
      show() {
        return (!this.onlineStatus && this.apiKeysRelatedRecords.length) ||
          (this.onlineStatus && this.retryingRequests) ||
          (this.onlineStatus && this.apiKeysRelatedRecentSuccessSyncs.length) ||
          (this.onlineStatus && this.lastReqConflictsDetected);
      },
      apiKeysRelatedRecords() {
        return this.records.filter(record => this.apiKeys.indexOf(record.key) > -1);
      },
      apiKeysRelatedRecentSuccessSyncs() {
        return this.recentSuccessSyncs.filter(res => this.apiKeys.indexOf(res.record.key) > -1);
      },
    },
    methods: {
      ...mapActions('offline', [
        'syncRecords',
        'retryRequests',
        'removeRecords',
      ]),
      async retryRequestsIfNeeds() {
        if (
          (this.onlineStatus && this.apiKeysRelatedRecords.length) &&
          (this.autoRetry || this.lastReqConflictsDetected)
        ) {
          try {
            await this.retryRequests({
              keys: this.apiKeys,
              reduce: this.reduceResponses,
              force: this.lastReqConflictsDetected
            });
          } catch (e) {
            this.$notify.error({
              title: 'Error',
              message: JSON.stringify(e.response.data)
            });
          }
        }
      },
      async refreshFromServer() {
        this.$emit('data-refresh-request');
        await this.removeRecords(this.apiKeys);
      },
      async forceRetry() {
        await this.retryRequestsIfNeeds();
      },
    },
    watch: {
      async onlineStatus() {
        await this.retryRequestsIfNeeds();
      },
      show(value) {
        if (value) {
          this.hidden = false;

          setTimeout(() => {
            if (this.apiKeysRelatedRecords.length) {
              this.hidden = true;
            }
          }, 2e3);
        }
      },
    },
  };
</script>

<template>
  <portal to="bottom-right" :order="40">
    <div :class="classes" v-if="show && !hidden">
      <p class="offline-notification__header">{{header}}</p>
      <div class="offline-notification__message">{{message}}</div>
      <div class="offline-notification__conflicts" v-if="lastReqConflictsDetected">
        <el-button @click="refreshFromServer"
                   type="success" round size="mini">Refresh from server
        </el-button>
        <el-button @click="forceRetry"
                   type="success" round size="mini">Save local edits
        </el-button>
      </div>
    </div>
  </portal>
</template>

<style lang="scss">
  .offline-notification {
    width: 331px;
    max-width: calc(100% - 40px);
    border-radius: 3px;
    background-color: #edf8eb;
    color: #67c23a;
    font-size: 14px;
    padding: 15px;
    letter-spacing: -0.5px;
    z-index: 100;
    box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.21);
    &_error {
      background-color: #fceff0;
      color: #ef7678;
    }
    &__header {
      font-weight: bold;
      margin-bottom: 5px;
    }
    &__conflicts {
      margin-top: 10px;
      .el-button {
        background: #2984c6;
        border-color: #2984c6;
      }
    }
  }
</style>
