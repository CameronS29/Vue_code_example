<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import Modal from 'Common/Modal.vue';
  import { Button } from 'element-ui';
  import * as consts from '../../../store/modules/scheduling/consts';
  import AffectedFlight from '../Common/AffectedFlight.vue';

  export default {
    components: {
      Modal,
      AffectedFlight,
      ElButton: Button,
    },

    computed: {
      ...mapState('scheduling/pairingTemplates', [
        'editablePairingTemplateGroupId',
        'showAffect',
        'affect',
        'affectLoading',
        'affectTemplateId',
      ]),

      ...mapGetters('scheduling/pairingTemplates', ['affectedFlights']),
    },

    methods: {
      ...mapMutations('scheduling/pairingTemplates', [
        consts.HIDE_AFFECT,
        consts.SHOW_AFFECT,
      ]),

      ...mapActions('scheduling/pairingTemplates', [
        'applyPairingTemplate',
        'getPairingTemplates',
      ]),

      badgeType(type) {
        switch (type) {
          case 'CREATE': return 'success';
          case 'UPDATE': return 'primary';
          case 'DELETE': return 'danger';
          default: return 'info';
        }
      },

      handleCloseModal() {
        this[consts.HIDE_AFFECT]();
      },

      async handleApply() {
        const loading = this.$loading({
          lock: true,
          text: 'Applying...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        });
        await this.applyPairingTemplate(this.affectTemplateId);
        loading.close();
        this.handleCloseModal();
        this.getPairingTemplates(this.editablePairingTemplateGroupId);
      },
    },
  };
</script>

<template>
  <modal :show="!!showAffect" class="draft-addition-popup" @close="handleCloseModal">
    <div class="draft-addition-popup__content" v-loading="affectLoading">
      <h3 class="draft-addition-popup__header">Apply Changes</h3>

      <div class="draft-addition-popup__content-wrapper">
        <div v-if="affectedFlights.addedFlights.length">
          <p>This {{ affectedFlights.addedFlights.length }} flights will be added:</p>
          <div class="draft-addition-popup__flight-list" >
            <affected-flight
              :flight="flight"
              :key="flight.id"
              v-for="flight in affectedFlights.addedFlights" />
          </div>
        </div>

        <div v-if="affectedFlights.deletedFlights.length">
          <p>This {{ affectedFlights.deletedFlights.length }} flights will be removed:</p>
          <div class="draft-addition-popup__flight-list" >
            <affected-flight
              :flight="flight"
              :key="flight.id"
              v-for="flight in affectedFlights.deletedFlights" />
          </div>
        </div>
      </div>

      <div v-if="affect.length > 0">
        <p>Affected Pairs:</p>
        <div class="draft-addition-popup__flight-list">
          <div class="draft-addition-popup__change"
               :key="`${pair.name}_${pair.date}_${pair.revision}`"
               v-for="({ pair, type }) in affect">
            <el-tag size="small" :type="badgeType(type)">{{ pair.name }}</el-tag>
            at {{ pair.date }}
            (Revision {{ pair.version }})
          </div>
        </div>
      </div>

      <div class="draft-addition-popup__btns">
        <el-button
          size="small"
          @click="handleCloseModal">Cancel
        </el-button>

        <el-button
          type="primary"
          size="small"
          @click="handleApply">Apply
        </el-button>
      </div>
    </div>
  </modal>
</template>

<style lang="scss">
  .draft-addition-popup {
    &__content {
      padding: 10px;
    }
    &__content-wrapper {
      display: flex;

      & > * {
        margin-left: 10px;

        &:first-child {
          margin-left: 0;
        }
      }
    }
    &__header {
      margin-bottom: 20px;
    }
    &__btns {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 20px;
    }
    &__flight-list {
      max-height: 200px;
      overflow: auto;
      margin-bottom: 15px;
    }
    &__flight, &__change {
      margin-bottom: 5px;
    }
  }
</style>
