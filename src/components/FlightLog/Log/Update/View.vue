<script src="updateMixin.js"></script>
<script>
  import debounce from 'lodash/debounce';
  import forEach from 'lodash/forEach';
  import { getErrorMessage } from '../../../../utils/api';
  import find from 'lodash/find';
  import { DateTime } from 'luxon';
  import {
    SET_FLIGHTLOG,
    INC_CALC_NIGHT_TIME_FLAG,
    STATUS_COMPLETED,
    STATUS_DISPATCH_PENDING,
  } from 'store/modules/flightlog/consts';
  import manifestApi from "../../../../api/pilotManifest";
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import StatusBlock from '../Common/StatusBlock.vue';
  import Saved from 'Common/Saved.vue';
  import FlightInformation from './Partials/FlightInformation.vue';
  import Crew from './Partials/Crew.vue';
  import PilotInput from './Partials/PilotInput.vue';
  import { LogEventBus } from './updateMixin';
  import { RetryAndAskToMergeScenario as OfflineNotification, mergeFieldsReduce } from '../../../../utils/offline';
  import { PATCH_FLIGHT_LOG_STORE_KEY } from '../../../../api/flightlog';

  export default {
    components: {
      StatusBlock,
      FlightInformation,
      Crew,
      PilotInput,
      OfflineNotification,
      Saved,
    },

    created() {
      this.getManifestLogs(this.manifest.id);
    },

    computed: {
      ...mapGetters('flightlog', [
        'flightlog',
        'savedIndication',
      ]),
      ...mapGetters('flightlog/sunSetRise',
        {
          'sunSetRiseData': 'data',
          'sunSetRisePendingKeys': 'pendingKeys',
        },
      ),
      ...mapGetters('pilotManifest', [
        'manifest',
      ]),
      ...mapGetters(
        'offline',
        ['onlineStatus']
      ),
      isFlightLogOpen() {
        return this.flightlog.open;
      },
      isFlightMightBeReopen() {
        return !this.isFlightLogOpen &&
          this.manifest.status !== STATUS_DISPATCH_PENDING &&
          this.manifest.status !== STATUS_COMPLETED;
      },
      offlineApiKeys() {
        return [
          PATCH_FLIGHT_LOG_STORE_KEY(this.flightlog.id)
        ];
      },
      canForceSync() {
        return (this.$route.name.indexOf('fsdo') == -1) && !this.flightlog.open;
      },
      manifestEditPath() {
        const { name } = this.$route;
        if (name.indexOf('dispatch_') > -1) {
          return 'dispatch_manifest_edit';
        } else {
          return 'pilot_manifest_edit';
        }
      },
    },

    methods: {
      ...mapActions('flightlog', [
        'getFlightLog',
        'patchFlightlog',
        'setPartialUpdate',
        'forceSync',
      ]),
      ...mapActions('flightlog/sunSetRise', [
        'getSunSetRiseInfo',
      ]),
      ...mapMutations('flightlog', [
        SET_FLIGHTLOG,
        INC_CALC_NIGHT_TIME_FLAG,
      ]),
      ...mapActions('manifest/logs', [
        'getManifestLogs',
      ]),
      partialSaveFlightlog() {
        if (this.timerId) {
          window.clearTimeout(this.timerId);
        }

        this.timerId = window.setTimeout(async () => {
          try {
            this.patchFlightlog();
          } catch ({ response }) {
            if (this.onlineStatus) {
              this.$notify({
                type: 'error',
                title: 'Error on saving...',
                dangerouslyUseHTMLString: true,
                message: getErrorMessage(response),
              });
            }
          }

          this.timerId = null;
        }, 800);
      },
      approveReopen() {
        this.$confirm(`Please confirm reopening flight log #${this.flightlog.flight.flight_number}`, 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        }).then(() => {
            this.setPartialUpdate({ open: true });
            this.patchFlightlog();
        });
      },

      goToManifestPage() {
        const name = this.$route.name.indexOf('pilot_') > -1 ?
          'pilot_manifest_edit' : 'dispatch_manifest_edit';
        this.$router.push({
          name,
          params: {
            id: this.flightlog.manifest.id,
          }
        });
      },
      save() {
        const that = this;
        this.patchFlightlog(false)
        .then(()=>{
          this.goToManifestPage();
        })
        .catch(({response}) => {
          that.onlineStatus && that.$notify({
            type: 'error',
            title: 'Error on saving...',
            dangerouslyUseHTMLString: true,
            message: getErrorMessage(response)
          });
        });
      },
      complete() {
        forEach(this.$refs, (comp) => comp.$v.$touch());
        this.$nextTick(() => {
          if (!find(this.$refs, (comp) => comp.$v.$error)) {
            this.setPartialUpdate({ open: false });
            this.patchFlightlog().then((res) => {
              this.goToManifestPage();
            }).catch((res) => this.$notify({
              type: 'error',
              title: 'Error completing log',
              dangerouslyUseHTMLString: true,
              message: JSON.stringify(res.response.data)
            }));
          } else {
            $('html, body').animate({
              scrollTop: $('.btq-form__group_error').offset().top - 20
            });
          }
        });
      },
      reduceOfflineResponses(responses) {
        return mergeFieldsReduce(responses);
      },
      handleOfflineState(state) {
        this[SET_FLIGHTLOG](state.flightlog);
      },
      async handleEntityRefresh() {
        await this.getFlightLog(this.flightlog.id)
      },
      handleForceSync() {
        this.forceSync()
          .then(res => {
            this.$router.push(
              {
                name: this.manifestEditPath,
                params: { id: this.flightlog.manifest.id }
              }
            );
          })
          .catch(_ =>
            this.$notify({
              type: 'error',
              title: 'Force Sync(elog 1.0)',
              message: 'There was an error while syncing. Please try later...',
            })
          );
      },
    },
    watch: {
      flightlog: {
        handler(newVal, oldVal) {
          if (
          newVal.flight.origin !== oldVal.flight.origin ||
          newVal.flight.destination !== oldVal.flight.destination ||
          newVal.actual_datetime_off !== oldVal.actual_datetime_off ||
          newVal.actual_datetime_on !== oldVal.actual_datetime_on ||
          newVal.actual_datetime_out !== oldVal.actual_datetime_out ||
          newVal.actual_datetime_in !== oldVal.actual_datetime_in ) {
            this[INC_CALC_NIGHT_TIME_FLAG]();
          }
        },
        deep: true
      }
    }
  };
</script>

<template>
  <div>
    <saved :display="savedIndication"></saved>
    <status-block />
    <crew ref="crew" />
    <flight-information />
    <pilot-input ref="pilotInput" />
    <portal v-if="isFlightLogOpen" to="bottom-right" :order="20">
      <button class="btn btn-primary log__btn log__btn_save" @click="save" title="Save Flightlog">
        <i class="fa fa-save"></i>
      </button>
    </portal>

    <portal v-if="isFlightLogOpen" to="bottom-right" :order="21">
      <button class="btn btn-danger log__btn log__btn_complete" @click="complete" title="Complete Flightlog">
        <i class="fa fa-check"></i>
      </button>
    </portal>

    <button v-if="isFlightLogOpen" class="btn btn-primary bottom-btn" @click="save" title="Save Flightlog">
      <i class="fa fa-save"></i> Save
    </button>

    <button v-if="isFlightLogOpen" class="btn btn-danger bottom-btn" @click="complete" title="Complete Flightlog">
      <i class="fa fa-check"></i> Complete
    </button>

    <button
      v-if="isFlightMightBeReopen"
      class="btn btn-warning bottom-btn"
      @click="approveReopen"
      title="Reopen Flightlog">
      <i class="fa fa-refresh"/> Reopen
    </button>

    <button class="btn btn-black btn-rounded log-view__controls-btn"
            @click="handleForceSync" v-if="canForceSync">
      Force Sync (elog 1.0)
    </button>

    <offline-notification
      entityName="Flight Log"
      :autoRetry="true"
      :apiKeys="offlineApiKeys"
      :reduceResponses="reduceOfflineResponses"
      @sync-offline="handleOfflineState"
      @data-refresh-request="handleEntityRefresh"
    />
  </div>
</template>

<style lang="scss">
  .bottom-btn {
    margin: 10px 0;

    &:not(:last-child) {
      margin-right: 15px;
    }
  }
</style>
