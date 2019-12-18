<script>
  import toDate from 'date-fns/toDate';
  import isValid from 'date-fns/isValid';
  import format from 'date-fns/format';

  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { VALIDATE_COMPLETE, UPDATE_MANIFEST } from '../../../../store/modules/pilotManifest/consts';

  import { Row, Col } from 'element-ui';
  import { debounce, sortBy, get } from 'lodash';
  import VerticalForm from "Common/Form/VerticalForm.vue";
  import ButtonEl from "Common/Button.vue";
  import Saved from "Common/Saved.vue";
  import StatusBlock from '../Common/StatusBlock.vue';
  import GeneralInfo from './Partials/GeneralInfo.vue';
  import FlightInfo from './Partials/FlightInfo.vue';
  import DutyOnTime from './Partials/DutyOnTime.vue';
  import DutyOffTime from './Partials/DutyOffTime.vue';
  import HoursTable from '../Common/HoursTable.vue';
  import FlightLogs from './Partials/FlightLogs.vue';
  import DeleteLogModal from './Partials/DeleteLogModal.vue';
  import CompleteLogModal from './Partials/CompleteLogModal.vue';
  import VorFireCheckRow from './Partials/VorFireCheckRow.vue';
  import ManifestLoading from '../ManifestLoading.vue';
  import LogProgress from '../../../Dispatch/Common/ManifestProgress.vue';
  import DispatchConfirmModal from '../../../Dispatch/Common/ManifestConfirmModal.vue';
  import PilotConfirmModal from '../Common/ConfirmModal.vue';
  import PickFlightModal from './PickFlight/Modal.vue';
  import EditFlightModal from './EditFlight/Modal.vue';

  import { RetryAndAskToMergeScenario as OfflineNotification, mergeFieldsReduce } from '../../../../utils/offline';
  import {
    STATUS_OPEN,
    STATUS_PENDING_PIC,
    STATUS_DISPATCH_PENDING,
    STATUS_DISPATCH_RE_OPEN,
    STATUS_COMPLETED,
  } from '../../../../store/modules/flightlog/consts';
  import { PATCH_MANIFEST_STORE_KEY } from '../../../../api/pilotManifest';

  export default {
    props: {
      id: [String, Number],
      hideButtons: Boolean,
      backUrl: String
    },
    components: {
      StatusBlock,
      VerticalForm,
      GeneralInfo,
      FlightInfo,
      DutyOnTime,
      DutyOffTime,
      FlightLogs,
      HoursTable,
      LogProgress,
      ManifestLoading,
      VorFireCheckRow,
      PilotConfirmModal,
      DispatchConfirmModal,
      DeleteLogModal,
      CompleteLogModal,
      ButtonEl,
      PickFlightModal,
      EditFlightModal,
      Saved,
      ElRow: Row,
      ElCol: Col,
      OfflineNotification,
    },

    computed: {
      ...mapGetters('pilotManifest', [
        'manifest',
        'inprogress',
        'invalidFieldsCount',
        'savedIndication'
      ]),
       ...mapGetters(
        'offline',
        ['onlineStatus']
      ),
      ...mapGetters('manifest/logs', [
        'logs',
      ]),
      pilotPage() {
        return this.$route.name.indexOf('pilot_') > -1;
      },
      dashboardPathName() {
        return this.pilotPage ? 'pilot_dashboard' : 'dispatch_dashboard';
      },
      completable() {
        if ( (this.manifest.status <= STATUS_PENDING_PIC || this.manifest.status == STATUS_DISPATCH_RE_OPEN)
            && this.$route.name.indexOf('dispatch_') > -1 ) {
          return false;
        }

        return true;
      },
      sendable() {
        if (this.manifest.status == STATUS_DISPATCH_RE_OPEN && this.$route.name.indexOf('dispatch_') > -1) {
          return true;
        }
        return false;
      },
      updatable() {
        if (this.pilotPage) {
          return this.manifest.status <= STATUS_PENDING_PIC || this.manifest.status === STATUS_DISPATCH_RE_OPEN;
        }

        return this.manifest.status != STATUS_DISPATCH_PENDING && this.manifest.status != STATUS_COMPLETED;
      },
      offlineApiKeys() {
        return [
          PATCH_MANIFEST_STORE_KEY(this.manifest.id)
        ];
      },
    },
    beforeMount() {
      if (!this.updatable) {
        const name = this.pilotPage ? 'pilot_manifest_view' : 'dispatch_manifest_view';
        this.$notify({
          type: 'error',
          title: 'Manifest Update',
          message: 'Manifest is not in updatable status',
        });
        this.$router.push({ name, params: { id: this.manifest.id } });
        return;
      }

      // always fetch latest manifest data from server: due to hours total
      // @TODO consider manifest total updates on client side
      this.refreshManifest(this.manifest.id);
    },
    methods: {
      ...mapActions('pilotManifest', [
        'refreshManifest',
        'patchManifest',
        'saveManifest',
      ]),
      ...mapActions('pilotManifest/confirm', {
        setPilotConfirm: 'setManifest',
      }),
      ...mapActions('dispatch/confirm', {
        setDispatchConfirm: 'setManifest',
      }),
      ...mapActions('pilotManifest/pickFlight', ['setFilterData']),
      ...mapMutations('pilotManifest', [
        UPDATE_MANIFEST,
        VALIDATE_COMPLETE,
      ]),
      showErrorMsg({data, status}) {
        let message = 'Check your network connection or try again later';
        if (status == 400) {
          if (Object.keys(data).indexOf('aircraft') > -1) {
            message = "Error Saving Manifest. An aircraft must be selected for each manifest. If you do not save an aircraft it will save with the last selected aircraft.";
          }


        }

        this.$notify({
          type: 'error',
          title: 'Error saving manifest',
          message
        });
      },
      partialSaveManifest() {
        if (this.timerId) {
          window.clearTimeout(this.timerId);
        }

        const that = this;
        this.timerId = window.setTimeout(function() {
          that.patchManifest()
          .catch(({ response }) => {
            if (that.onlineStatus) {
              that.showErrorMsg(response);
            }
          });
        }, 800);
      },
      save() {
        this.saveManifest().catch(({ response }) => {
          if (this.onlineStatus) {
            this.showErrorMsg(response);
          }
        });
      },
      picApproval() {
        this.confirmStatus = null;
        this[VALIDATE_COMPLETE]();
        this.$nextTick(() => {
          if (this.invalidFieldsCount == 0) {
            if (this.manifest.status !== 4) {
              this.setPilotConfirm(this.manifest);
            } else {
              this.setDispatchConfirm(this.manifest);
            }
          } else {
            $('html, body').animate({
              scrollTop: $('.btq-form__group_error').offset().top - 20
            });
          }
          // this[VALIDATE_COMPLETE](false);
        });
      },

      sendPIC() {
        this.confirmStatus = 'send';
        this.setDispatchConfirm(this.manifest);
      },

      addNewLog() {
        const { manifest } = this;
        const filters = {
          date: manifest.created_on,
          origin: manifest.last_dest,
        };

        const { logs = [] } = this;
        if (logs.length > 0) {
          const lastLog = logs[logs.length - 1];
          const arrival = toDate(lastLog.actual_datetime_in || get(lastLog, 'flight.scheduled_arrival'));
          const date = (isValid(arrival)
            ? format(arrival, 'MM/dd/yyyy')
            : manifest.created_on);

          const logFilters = { date, origin: lastLog.flight.destination_pk };
          Object.assign(filters, logFilters);
        }

        this.setFilterData(filters);
      },

      handleNewLog(log) {
        this.$router.push({
          name: 'pilot_log_edit',
          params: {
            id: this.manifest.id,
            logId: log.id
          }
        });
      },
      reduceOfflineResponses(responses) {
        return mergeFieldsReduce(responses);
      },
      handleOfflineState(state) {
        this[UPDATE_MANIFEST](state.manifest);
      },
      async handleEntityRefresh() {
        await this.getManifest(this.manifest.id)
      }
    },
    validations() {
      return {};
    },
    validationMessages: {},
    data() {
      return {
        confirmStatus: '',
      };
    },
  };
</script>

<template>
  <div class="manifest-update-page">
    <saved :display="savedIndication"></saved>
    <pilot-confirm-modal />
    <dispatch-confirm-modal :status="confirmStatus"/>
    <delete-log-modal />
    <complete-log-modal />
    <pick-flight-modal @log:created="handleNewLog" />
    <edit-flight-modal @log:created="handleNewLog" />
    <status-block></status-block>
    <vertical-form>
      <el-row >
        <el-col :xs="24" :sm="16">
          <log-progress
            :status="manifest.status"
            class="manifest-update-page__progress" />
        </el-col>
        <el-col :xs="24" :sm="8" class="manifest-update-page__controls">
          <el-row :gutter="20">
            <el-col :span="12">
              <button-el
                :disabled="inprogress"
                @click="picApproval"
                v-if="completable"
                label="Complete"
                class="btn-full-width"
                type="danger" rounded />
            </el-col>
            <el-col :span="12" v-if="sendable">
              <button-el
                :disabled="inprogress"
                @click="sendPIC"
                label="Send for PIC PIN"
                class="btn-full-width"
                type="success" rounded />
            </el-col>
            <el-col :span="12">
              <button-el
                :disabled="inprogress"
                @click="save"
                v-if="updatable"
                label="Save"
                class="btn-full-width"
                type="success" rounded />
            </el-col>
            <el-col :span="12">
               <a
                :href="`/flightlog/pdf-report/${manifest.id}/`"
                class="btn btn-dark-blue btn-rounded btn-full-width"
                title="Generate PDF log"
                target="_blank"
              >
                <i class="fa fa-file-pdf-o"></i>  View PDF
              </a>
            </el-col>
            <el-col :span="12">
              <router-link
                :to="{ name: dashboardPathName}"
                title="View Log"
                class="manifest-update-page__dashboard-btn btn btn-dark-blue btn-rounded btn-full-width">
                <i class="fa fa-home"></i>
                <span class="manifest-update-page__dashboard-view">View</span> Dashboard
              </router-link>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <general-info @update:manifest="partialSaveManifest" />
      <duty-on-time @update:manifest="partialSaveManifest" />
      <flight-info ref="filgihtInfo" @update:manifest="partialSaveManifest" />
      <duty-off-time @update:manifest="saveManifest" />
    </vertical-form>
    <flight-logs :manifestId="manifest.id" @addnewlog="addNewLog"/>
    <vor-fire-check-row />
    <HoursTable />
    <offline-notification
      entityName="Flight Manifest"
      :autoRetry="true"
      :apiKeys="offlineApiKeys"
      :reduceResponses="reduceOfflineResponses"
      @sync-offline="handleOfflineState"
      @data-refresh-request="handleEntityRefresh"
    />
  </div>
</template>

<style lang="scss">
  @import "../../../../../scss/bs-variables";

  .manifest-update-page {
    &__progress {
      @media screen and (max-width: $screen-sm) {
        padding-right: 25px;
      }
      @media screen and (max-width: $screen-xs-max) {
        padding-right: 0;
      }
    }
    &__controls {
      @media screen and (max-width: $screen-sm) {
        padding-top: 13px;
      }
      @media screen and (max-width: $screen-xs-max) {
        padding-top: 0;
      }
    }
    &__dashboard-btn {
      @media screen and (max-width: $screen-sm) {
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
    &__dashboard-view {
      @media screen and (max-width: $screen-sm) {
        display: none;
      }
    }
  }
</style>
