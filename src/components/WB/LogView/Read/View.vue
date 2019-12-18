<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import moment from 'moment';

  import Card from 'Common/Card.vue';
  import { SET_REOPEN } from '../../../../store/modules/wb/consts';

  import Flight from './Partials/Flight.vue';
  import Crew from '../ConfirmModal/Partials/Crew.vue';
  import Passengers from '../ConfirmModal/Partials/Passengers.vue';
  import Fuel from './Partials/Fuel.vue';
  import Graph from '../Common/Graph.vue';
  import GateBox from '../Common/GateBox.vue';
  import TsaBox from '../Common/TsaBox.vue';
  import AircraftBox from '../Common/AircraftBox.vue';
  import ReopenLog from './Partials/ReopenLog.vue';
  import CalcTable from '../Common/CalcTable.vue';
  import Remarks from './Partials/Remarks.vue';
  import ConfirmLog from '../../Common/Confirm.vue';

  import LogButton from '../../Common/LogButton.vue';
  import logViewMixin from '../mixins/logViewMixin';

  export default {
    mixins: [logViewMixin],

    components: {
      Card,

      Remarks,
      Flight,
      Crew,
      Passengers,
      Graph,
      Fuel,
      TsaBox,
      GateBox,
      CalcTable,
      AircraftBox,
      ReopenLog,
      LogButton,
      ConfirmLog,
    },

    created() {
      this.retrieveLogData();
    },

    computed: {
      ...mapGetters('wb', [
        'log',
        'saved',
        'selectedAircraftType',
        'selectedAircraft',
        'securityAware',
        'securityRestriction',
        'isLoading',
      ]),

      ...mapGetters('wb/confirmations', [
        'confirmations',
        'PICConfirmation',
        'dispatchConfirmation',
      ]),

      securitySearchDone() {
        return (this.securityAware && this.log.security_checked) || (this.securityRestriction && this.log.security_search_performed);
      }
    },

    methods: {
      ...mapMutations('wb', [SET_REOPEN]),
      ...mapActions('wb', ['getWBLog', 'reset', 'sendPDF']),
      ...mapActions('wb/confirmation', ['openConfirmation']),
      ...mapActions('wb/confirmations', ['getConfirmations']),
      ...mapActions('wb/passenger', ['receivePassengers']),

      reOpen() {
        this[SET_REOPEN](true);
      },

      sendPDFEmail() {
        this.sendPDF(this.log.id).then(() => this.$notify({
          title: 'Success',
          message: 'PDF e-mail was successfully scheduled',
          type: 'success',
        }));
      },

      retrieveLogData() {
        return this.getConfirmations(this.id);
      },
    },

    filters: {
      moment(date) {
        return moment(date).format('MMMM Do YYYY, h:mm:ss a');
      },
    },
  };
</script>

<template>
  <div>
    <reopen-log />
    <confirm-log />

    <div>
      <flight />
      <div class="wb-flow wb-detail__body">
        <div class="wb-detail__container" :class="calcColumnClasses">
          <crew />
          <passengers :id="id" />

          <div class="row" v-if="selectedAircraft && log.aircraft">
            <div class="col-xs-12 log-update__aircraft-values">
              <fuel class="log-update__item log-update__fuel" />
              <aircraft-box class="log-update__item log-update__aircraft-box" />
              <tsa-box class="log-update__item log-update__tsa-box" />
              <gate-box class="log-update__item log-update__gate-box log-update__gate-box_upper" />
            </div>
          </div>

          <div class="row" v-if="log && selectedAircraftType">
            <div class="col-xs-12 log-update__aircraft-values">
              <div class="panel panel-body log-update__item log-update__calc-table">
                <calc-table class="" v-if="selectedAircraft" />
              </div>
              <gate-box class="log-update__item log-update__gate-box log-update__gate-box_lower" />
            </div>
          </div>

          <card title="Confirmations:">
            <div class="wb-detail__confirmation-text">
              I certify that I have flown this route within the last<br>
              90 days and/or familiarized myself with all information required for safe operation of this flight.
            </div>
            <div class="wb-detail__confirmation-text" v-if="securitySearchDone">
              <i class="fa fa-check"></i>&nbsp;I certify that the security search has been conducted
              prior to the departure of this flight as per company procedures.
            </div>
            <div v-if="PICConfirmation && PICConfirmation.author">
              <strong>PIC Signature:</strong>
              {{ PICConfirmation.author.first_name || 'Unknown' }}
              {{ PICConfirmation.author.last_name }}
            </div>
            <div v-if="dispatchConfirmation && dispatchConfirmation.author">
              <strong>Dispatcher Acceptance:</strong>
              {{ dispatchConfirmation.author.first_name || 'Unknown' }}
              {{ dispatchConfirmation.author.last_name }}
            </div>
          </card>
        </div>

        <div class="wb-detail__container" :class="graphColumnClasses">
          <graph />
          <remarks v-if="log.remarks" />
        </div>
      </div>
    </div>

    <div class="wb-actions" v-if="log.id">
      <log-button class="el-button is-plain"
                  as="a"
                  target="_blank"
                  :href="log.pdf_url"
                  :disabled="!selectedAircraftType">
        View PDF
      </log-button>

      <log-button v-if="user.is_admin && !hideButtons" @click="sendPDFEmail" :disabled="!selectedAircraftType">
        Send PDF
      </log-button>

      <log-button
        v-if="!hideButtons && (log.available_for_reopen || user.is_admin)"
        @click="reOpen"
        :disabled="isBlocked"
        icon="el-icon-refresh"
        :loading="isLoading"
      >
        <span v-if="user.is_admin && !log.available_for_reopen">Admin</span> Reopen
      </log-button>

      <log-button
        v-if="!hideButtons"
        as="router-link"
        class="el-button el-button--primary is-plain"
        :to="{ name: 'wb_list', params: { type: log.aircraft_type } }"
      >
        Back to list
      </log-button>
    </div>
    <div class="confirm-button" v-if="readyForDispatch">
      <log-button @click="openConfirmation(log)" type="success" :disabled="isBlocked">
        Confirm (Dispatch)
      </log-button>
    </div>
  </div>
</template>

<style lang="scss" src="../../scss/logview.scss"></style>
