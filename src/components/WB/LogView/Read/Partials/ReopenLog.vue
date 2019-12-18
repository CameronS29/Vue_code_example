<script>
  import Promise from 'bluebird';
  import { mapGetters, mapActions, mapMutations } from 'vuex';

  import Modal from 'Common/Modal.vue';
  import Card from 'Common/Card.vue';
  import { SET_REOPEN } from '../../../../../store/modules/wb/consts';

  export default {
    components: {
      Modal,
      Card,
    },

    computed: mapGetters('wb', [
      'reopenWindow',
      'isLoading',

      'selectedAircraft',
      'selectedDate',
      'selectedFlightNumber',
      'selectedDeparture',
      'selectedArrival',

      'selectedPIC',
      'selectedSIC',

      'log',
    ]),

    methods: {
      ...mapMutations('wb', [SET_REOPEN]),
      ...mapActions('wb', ['markWBLogReady']),

      closeModal() {
        this[SET_REOPEN](false);
      },

      reopenLog() {
        this.markWBLogReady(this.log.id)
          .then(() => {
            this.closeModal();
            window.scrollBy(0, -window.scrollY);
          })
          .catch(() => this.$notify({
            type: 'error',
            title: 'Cannot reopen log',
            message: 'Check your connection or try again later',
          }));
      },
    },
  };
</script>

<template>
  <modal :show="reopenWindow" transparent :show-close="false" @close="closeModal">
    <card class="wb-reopen-window" :title="`Reopen Log #${log.id}?`" mode="dark">
      <card title="Log Details" class="wb-reopen-window__content">

        <div class="wb-reopen-window__item">
          Tail Number: <strong>{{ selectedAircraft.registration }}</strong>
        </div>
        <div class="wb-reopen-window__item">
          Flight Number: <strong>{{ selectedFlightNumber }}</strong>
        </div>
        <div class="wb-reopen-window__item">
          Origin: <strong>{{ selectedDeparture }}</strong>
        </div>
        <div class="wb-reopen-window__item">
          Destination: <strong>{{ selectedArrival }}</strong>
        </div>
        <div class="wb-reopen-window__item">
          Date: <strong>{{ selectedDate }}</strong>
        </div>

        <div class="wb-reopen-window__mark">
          Do you wish to re-open this Weight and Balance log?
        </div>
        <div class="wb-reopen-window__buttons">
          <el-button type="danger" size="medium" @click="closeModal">Cancel</el-button>
          <el-button type="primary" size="medium" :loading="isLoading" @click="reopenLog" icon="el-icon-refresh">
            Reopen
          </el-button>
        </div>
      </card>
    </card>
  </modal>
</template>

<style lang="scss">
  @import "../../../../../../scss/bs-variables";

  .wb-reopen-window {
    max-width: 455px;

    &__content.card {
      margin-bottom: 0;
      font-size: 14px;
    }

    &__buttons {
      text-align: right;
      margin: 15px 0 0;
    }

    &__mark {
      padding-top: 10px;
      margin-top: 15px;
      border-top: 1px solid $--border-color-base;
      text-align: center;
      font-size: 15px;
    }

    &__item {
      display: flex;
      justify-content: space-between;
    }

    @media screen and (max-width: $screen-xs-max) {
      .el-button {
        display: block;
        width: 100%;
        margin: 10px 0 0;
      }
    }
  }
</style>
