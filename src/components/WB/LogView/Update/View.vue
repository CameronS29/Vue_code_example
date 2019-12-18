<script>
  import Promise from 'bluebird';
  import { debounce, noop } from 'lodash';

  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import { Notification, Message } from 'element-ui';

  import Splash from 'Common/Splash.vue';
  import * as consts from '../../../../store/modules/wb/consts';

  import Flight from './Partials/Flight.vue';
  import Crew from './Partials/Crew.vue';
  import Passengers from './Partials/Passengers/View.vue';
  import Fuel from './Partials/Fuel.vue';
  import Graph from '../Common/Graph.vue';
  import Comments from './Partials/Comments.vue';
  import Remarks from './Partials/Remarks.vue';
  import SecurityCheck from './Partials/SecurityCheck.vue';
  import SecuritySearchPerformed from './Partials/SecuritySearchPerformed.vue';
  import ConfirmationBlock from './Partials/ConfirmationBlock.vue';
  import ErrorsAlert from './Partials/ErrorsAlert.vue';

  import TsaBox from '../Common/TsaBox.vue';
  import GateBox from '../Common/GateBox.vue';
  import AircraftBox from '../Common/AircraftBox.vue';
  import CalcTable from '../Common/CalcTable.vue';
  import LogButton from '../../Common/LogButton.vue';
  import ConfirmLog from '../../Common/Confirm.vue';

  import logViewMixin from '../mixins/logViewMixin';

  export default {
    mixins: [logViewMixin],

    components: {
      SecurityCheck,
      SecuritySearchPerformed,
      Flight,
      Crew,
      Passengers,
      Graph,
      Comments,
      Remarks,
      Fuel,
      TsaBox,
      GateBox,
      CalcTable,
      AircraftBox,
      ConfirmLog,
      ConfirmationBlock,
      ErrorsAlert,

      LogButton,
      Splash,
    },

    computed: {
      ...mapGetters('wb', ['errors', 'isValid', 'dueLocked']),

      ...mapGetters('user', ['isAdmin']),

      listRoute() {
        return {
          name: 'wb_list',
          params: {
            type: this.log.aircraft_type,
          },
        };
      },
      dueLock: {
        get() {
          return this.dueLocked;
        },
        set(value) {
          this.patchWBLock(value);
        }
      }
    },

    methods: {
      ...mapActions('wb', [
        'getWBLog',
        'getValidations',
        'patchWBLog',
        'flushRemotePartials',
        'pushWBLog',
        'deleteLog',
        'reset',
        'patchWBLock'
      ]),

      ...mapActions('wb/passenger', ['receivePassengers']),
      ...mapActions('wb/confirmation', ['openConfirmation']),
      ...mapActions('wb/confirmations', ['getConfirmations']),
      ...mapMutations('wb', [consts.SET_VALIDATE, consts.TOGGLE_DETAILED]),

      async approvePIC() {
        await this.flushRemotePartials();
        await this.patchWBLog(false);
        await this.getValidations(this.id);
        await this.$nextTick();

        if (this.isValid) {
          return this.openConfirmation(this.log);
        }
        this[consts.SET_VALIDATE](true);

        const error = document.querySelector('.error');
        if (error !== null) {
          error.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'center',
          });
        }

        return Message.error('Please fix all errors marked in red before pinning.');
      },

      toggleDetails() {
        this[consts.TOGGLE_DETAILED]();
      },

      confirmReset() {
        this.$confirm('You\'re going to clear entire log.' +
              ' This is destructive action and cannot be undone.' +
              ' Are you sure you want to proceed?')
          .then(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
          .then(() => this.softReset())
          .then(() => this.pushWBLog())
          .catch(noop);
      },

      handleDeleteLog() {
        this.$confirm('This will permanently delete this log. Continue?', 'Confirm Delete', {
          confirmButtonText: 'Delete',
          cancelButtonText: 'Cancel',
          confirmButtonClass: 'el-button--danger',
          type: 'error',
        }).then(() => this.deleteLog(this.id))
          .then(() => this.$router.push({ name: 'wb_list' }))
          .catch(noop);
      },

      saveLog: debounce(function () {
        return this.patchWBLog()
          .catch(({ response }) => Notification.error({
            title: 'Error saving log',
            message: response.data.message,
          }));
      }, 800, { wait: 400 }),

      async refresh() {
        await this.getWBLog(this.id);

        if (this.selectedAircraft) {
          this.receivePassengers(this.id);
        }
      },
    },
  };
</script>

<template>
  <div class="wb-detail">
    <confirm-log />

    <splash :visible="isBlocked" light class="wb-detail__block-splash">
      <flight @update:log="saveLog" :disabled="isBlocked" />

      <div class="wb-flow wb-detail__body">
        <div class="wb-detail__container" :class="calcColumnClasses">
          <crew @update:log="saveLog" :disabled="isBlocked" />
          <passengers v-if="log.aircraft" :id="id" @update:log="saveLog" :disabled="isBlocked" />

          <div class="row" v-if="selectedAircraft && log.aircraft">
            <div class="col-xs-12 log-update__aircraft-values">
              <fuel class="log-update__item log-update__fuel" @update:log="saveLog" :disabled="isBlocked" />
              <aircraft-box class="log-update__item log-update__aircraft-box" />
              <tsa-box class="log-update__item log-update__tsa-box" />
              <gate-box class="log-update__item log-update__gate-box log-update__gate-box_upper" />
            </div>
          </div>

          <div class="row" v-if="selectedAircraftType && selectedAircraft">
            <div class="col-xs-12 log-update__aircraft-values">
              <div class="panel panel-body log-update__item log-update__calc-table">
                <calc-table class="" v-if="selectedAircraft" />
              </div>
              <gate-box class="log-update__item log-update__gate-box log-update__gate-box_lower" />
            </div>
          </div>

        </div>

        <div class="wb-detail__container" :class="graphColumnClasses" v-if="!detailed">
          <graph />

          <remarks @update:log="saveLog" :disabled="isBlocked" />

          <div class="row" v-if="securityAware">
            <div class="col-xs-12 log-update__aircraft-values">
              <security-check @update:log="saveLog" />
            </div>
          </div>

          <div class="row" v-if="securityRestriction">
            <div class="col-xs-12 log-update__aircraft-values">
              <security-search-performed />
            </div>
          </div>

          <div class="row" v-if="!isValid">
            <div class="col-xs-12 log-update__aircraft-values">
              <errors-alert :errors="errors" />
            </div>
          </div>
        </div>
      </div>

      <div v-if="detailed">
        <div class="row">
          <div class="col-xs-12 col-sm-6 wb-graph">
            <graph />
          </div>
          <div class="col-xs-12 col-sm-6">
            <comments v-if="log.id" :disabled="isBlocked" />
            <errors-alert v-if="!isValid" :errors="errors" />
          </div>

          <div class="row" v-if="securityAware">
            <div class="col-xs-12 log-update__aircraft-values">
              <security-check @update:log="saveLog" />
            </div>
          </div>

          <div class="row" v-if="securityRestriction">
            <div class="col-xs-12 log-update__aircraft-values">
              <security-search-performed />
            </div>
          </div>
        </div>
      </div>

      <confirmation-block slot="visible" :user="blockingUser" />
    </splash>

    <div class="wb-actions">
      <div v-if="saved">
        Changes saved...
      </div>

      <log-button as="router-link"
                  :to="{ name: 'wb_list', params: { type: log.aircraft_type } }"
                  class="el-button el-button--primary is-plain">
        Back to list
      </log-button>

      <log-button @click="refresh"
                  :loading="isLoading"
                  icon="el-icon-refresh">
        Refresh
      </log-button>

      <log-button v-if="user.is_superuser || user.is_admin"
                  @click="toggleDetails"
                  :disabled="isBlocked || isLoading">
        {{ !detailed ? 'Detailed View' : 'Disable Detailed View' }}
      </log-button>

      <log-button
        v-if="readyForApproval"
        type="success"
        @click="approvePIC"
        :disabled="isBlocked || isLoading"
      >
        Confirm (PIC)
      </log-button>

      <log-button
        v-if="readyForDispatch"
        type="success"
        @click="openConfirmation(log)"
        :disabled="isBlocked || isLoading"
      >
        Confirm (Dispatch)
      </log-button>

      <div class="btn-block">
        <log-button
          type="danger"
          @click="confirmReset"
          :disabled="isBlocked || isLoading"
          plain
        >
          Clear Entire Sheet
        </log-button>

        <log-button
          v-if="canDelete"
          type="danger"
          @click="handleDeleteLog"
          :disabled="isBlocked || isLoading"
        >
          Delete
        </log-button>
      </div>
      <div>

        <el-switch v-if="isAdmin"
          v-model="dueLock"
          active-text="Allow FlightDoc block (admin)"
          active-color="#F84343"
          inactive-color="#FFCCCC">
        </el-switch>
      </div>
    </div>
  </div>
</template>

<style lang="scss" src="../../scss/logview.scss"></style>
