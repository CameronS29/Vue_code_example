<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import { Notification } from 'element-ui';

  import Modal from 'Common/Modal.vue';
  import Card from 'Common/Card.vue';
  import Icon from 'Common/Icon.vue';
  import ButtonEl from 'Common/Button.vue';

  import { UPDATE_LOG } from 'store/modules/wb/consts';

  import ActiveUsers from '../Common/ActiveUsers/View.vue';
  import Flight from './Partials/Flight.vue';
  import Crew from './Partials/Crew.vue';
  import Passengers from './Partials/Passengers.vue';
  import Calculations from './Partials/Calculations.vue';
  import Chart from './Partials/Chart.vue';
  import Load from './Partials/Load.vue';
  import Remarks from './Partials/Remarks.vue';
  import ConfirmForm from './Partials/ConfirmFrom.vue';

  import logBlockMixin from '../mixins/logBlockMixin';
  import activeUserMixin from '../mixins/activeUserMixin';
  import { connectMixin } from '../../../../sockets/index';


  export default {
    name: 'WBConfirmModal',

    mixins: [
      connectMixin(vm => (vm.log.id && `wb:${vm.log.id}`)),
      logBlockMixin,
      activeUserMixin,
    ],

    components: {
      Modal,
      Card,
      Icon,
      ButtonEl,

      ActiveUsers,
      Flight,
      Crew,
      Passengers,
      Calculations,
      Remarks,

      Chart,
      Load,
      ConfirmForm,
    },

    created() {
      this.getAllOptions();
    },

    computed: {
      ...mapGetters('user', ['isAdmin']),
      ...mapGetters('wb/confirmation', { confirmProgress: 'isLoading' }),

      ...mapGetters('wb', ['log']),
      ...mapGetters('wb', { logProgress: 'isLoading' }),

      logReport() {
        return `/wb/pdf/${this.log.id}/`;
      },
    },

    methods: {
      ...mapActions('wb', [
        'reset',
        'getWBLog',
        'getAllOptions',
        'getCalculations',
        'getCGLimits',
        'markWBLogReady',
        'sendPDF',
      ]),

      ...mapActions('wb/confirmations', ['getConfirmations']),
      ...mapActions('wb/confirmation', ['closeConfirmation']),
      ...mapMutations('wb', [UPDATE_LOG]),

      getLogData(newId) {
        if (newId !== undefined) {
          this.reset();
          this.clearUsers();

          this[UPDATE_LOG](this.confirmLog);
          this.getConfirmations(newId);
          this.getCalculations(newId);
          this.getWBLog(newId)
            .then(() => this.getCGLimits(this.log.aircraft_type));
        }
      },

      reopenLog() {
        return this.markWBLogReady(this.log.id)
          .then(() => this.closeConfirmation())
          .catch(() => Notification({
            type: 'error',
            title: 'Cannot reopen log',
            message: 'Check your connection or try again later',
          }));
      },

      sendPDFEmail() {
        return this.sendPDF(this.log.id)
          .then(() => Notification({
            type: 'success',
            title: 'Success',
            message: 'PDF e-mail was successfully scheduled',
          }))
          .catch(() => Notification({
            type: 'error',
            title: 'Cannot send PDF email',
            message: 'Call for dev PM',
          }));
      },
    },

    watch: {
      confirmOpened(isOpened) {
        if (isOpened) {
          setTimeout(this.declareMyself, 1000);
        } else {
          this.leaveLog();
        }
      },

      'confirmLog.id': 'getLogData',
    },
  };
</script>

<template>
  <modal :show="confirmOpened" :transparent="true" :show-close="false" @close="closeConfirmation">
    <card class="wb-confirm-modal" title="Weight & Balance Log" mode="dark">
      <div slot="title" class="wb-confirm-modal__heading">
        <h2 class="wb-confirm-modal__title">
          Weight & Balance Log #{{ log.id }}
        </h2>

        <router-link
          class="wb-confirm-modal__open-external"
          :to="{ name: 'wb_log', params: { id: log.id } }"
          title="Open Log Page"
        >
          <icon glyph="external-link" />
        </router-link>
      </div>

      <div class="wb-confirm-modal__contents">
        <div class="wb-confirm-modal__column wb-confirm-modal__column_left">
          <div class="wb-confirm-modal__row">
            <flight class="wb-confirm-modal__block wb-confirm-modal__block_flight" />
            <crew class="wb-confirm-modal__block wb-confirm-modal__block_crew" />
          </div>

          <div class="wb-confirm-modal__row">
            <passengers class="wb-confirm-modal__block" :id="confirmLog.id" />
          </div>

          <div class="wb-confirm-modal__row wb-confirm-modal__row_calculations">
            <calculations class="wb-confirm-modal__block wb-confirm-modal__block_calc" />
            <load class="wb-confirm-modal__block wb-confirm-modal__block_load" />
          </div>
        </div>

        <div class="wb-confirm-modal__column wb-confirm-modal__column_right">
          <div class="wb-confirm-modal__row">
            <chart class="wb-confirm-modal__block" />
          </div>

          <div class="wb-confirm-modal__row">
            <remarks v-if="log.remarks" class="wb-confirm-modal__block" />
          </div>

          <div class="wb-confirm-modal__row">
            <confirm-form class="wb-confirm-modal__block" />
          </div>

          <div class="wb-confirm-modal__row">
            <div class="wb-confirm-modal__block wb-confirm-modal__block_buttons">
              <button-el
                v-if="log.available_for_reopen || isAdmin"
                type="success"
                class="wb-confirm-modal__button"
                icon="repeat"
                @click="reopenLog"
                :disabled="logProgress || confirmProgress"
                rounded
              >
                <span v-if="isAdmin && !log.available_for_reopen">Admin</span> Reopen
              </button-el>

              <button-el
                type="success"
                class="wb-confirm-modal__button"
                label="Send PDF"
                icon="file-pdf-o"
                @click="sendPDFEmail"
                :disabled="logProgress || confirmProgress"
                rounded
              />

              <a class="btn btn-rounded btn-success wb-confirm-modal__button" target="_blank" :href="logReport">
                <i class="fa fa-eye" />
                View PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </card>

    <transition name="wb-confirm-modal__fade" appear>
      <div class="wb-confirm-modal__active-users" v-if="users.length > 0">
        <active-users :users="users" />
      </div>
    </transition>
  </modal>
</template>

<style lang="scss" scoped>
  @import '../../../../../scss/bs-variables';

  .wb-confirm-modal {
    width: 95vw;
    max-width: 2000px;
    min-height: 80vh;
    color: white;
    font-size: 15px;
    margin-bottom: 100px;

    @media screen and (max-width: $screen-md-max) {
      font-size: 14px;
    }

    &__title {
      margin: 0;
      font-weight: bold;
      font-size: 24px;
    }

    &__heading {
      display: flex;
      justify-content: space-between;
    }

    &__open-external {
      background: #4A90E2;
      color: rgba(255, 255, 255, .8);
      border-radius: 50%;
      height: 34px;
      width: 34px;
      display: inline-block;
      padding: 4px 6px 0 8px;
      font-size: 20px;

      &:hover {
        color: white;
      }

      &:active {
        color: white;
        background: lighten(#4A90E2, 5%);
      }
    }

    &__contents {
      display: flex;
      flex-flow: row nowrap;
      padding: 0 5px 5px;
      margin-left: -20px;

      @media screen and (max-width: $screen-sm-max) {
        flex-wrap: wrap;
      }
    }

    &__column {
      display: flex;
      flex-flow: column nowrap;

      &_left {
        flex: 1 1 65%;
      }

      &_right {
        flex: 1 1 35%;
        max-width: 35%;
      }

      @media screen and (max-width: $screen-sm-max) {
        &_left, &_right {
          flex: 1 1 100%;
          max-width: 100%;
        }
      }
    }

    &__row {
      display: flex;
      flex-flow: row nowrap;
      justify-content: stretch;

      @media screen and (max-width: $screen-xs-max) {
        flex-wrap: wrap;
      }

      @media screen and (max-width: 425px) {
        &_calculations {
          padding-right: 20px;

          .wb-confirm-modal__block_load {
            margin-right: -20px;
          }
        }
      }
    }

    &__block {
      display: flex;
      flex: 1 1 100%;
      margin-left: 20px;

      &_flight, &_load {
        flex: 1 1 40%;
        max-width: 40%;
      }
      &_crew, &_calc {
        flex: 1 1 60%;
        max-width: 60%;
      }

      &_buttons {
        justify-content: flex-end;
        flex-wrap: wrap;
      }

      @media screen and (max-width: $screen-xs-max) {
        max-width: 100%;

        &_flight, &_load  { flex: 1 1 100%; }
        &_crew, &_calc { flex: 1 1 100%; }
        &_buttons { flex-flow: column nowrap; }
      }
    }

    &__button {
      margin-left: 10px;

      @media screen and (max-width: $screen-md-max) {
        margin-left: 0;
        margin-top: 10px;
        width: 100%;

        &:first-child {
          margin-top: 0;
        }
      }
    }

    &__active-users {
      position: fixed;
      bottom: 20px;
      left: 20px;
    }

    &__fade {
      &-enter-active, &-leave-active {
        transition: opacity .3s linear;
      }
      &-enter, &-leave-to {
        opacity: 0;
      }
      &-enter-to, &-leave {
        opacity: 1;
      }
    }
  }
</style>
