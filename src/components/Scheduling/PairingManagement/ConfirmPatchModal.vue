<script>
  import { mapState, mapMutations } from 'vuex';
  import { flatten, filter, map, groupBy } from 'lodash';

  import Modal from 'Common/Modal.vue';
  import Card from 'Common/Card.vue';

  import * as consts from '../../../store/modules/scheduling/consts';
  import AffectedFlight from '../Common/AffectedFlight.vue';
  import AffectedShift from '../Common/AffectedShift.vue';

  export default {
    components: {
      Card,
      Modal,
      AffectedFlight,
      AffectedShift,
    },

    computed: {
      ...mapState('scheduling/revisions', ['affect']),
      ...mapState('scheduling/pairings', ['isAffectModalActive']),

      affectedPairs() {
        return [
          flatten(filter(map(this.affect.pairs, 'added_flights'))),
          flatten(filter(map(this.affect.pairs, 'deleted_flights'))),
        ];
      },

      affectedShifts() {
        return groupBy(this.affect.shifts, 'type');
      },
    },

    methods: {
      ...mapMutations('scheduling/pairings', [consts.TOGGLE_AFFECT_MODAL]),

      handleCloseModal() {
        this[consts.TOGGLE_AFFECT_MODAL](false);
      },
    },
  };
</script>
<template>
  <modal show transparent class="confirm-patch-modal" @close="handleCloseModal">
    <card title="Schedule Revision Changes">
      <div class="confirm-patch-modal__wrapper">
        <div class="confirm-patch-modal__content" v-if="affectedPairs[0].length > 0">
          <h4 class="confirm-patch-modal__header">These flights will be added:</h4>
          <div class="confirm-patch-modal__flight-list">
            <affected-flight
              :flight="flight"
              :key="flight.id"
              v-for="flight in affectedPairs[0]"
            />
          </div>
        </div>

        <div class="confirm-patch-modal__content" v-if="affectedPairs[1].length > 0">
          <h4 class="confirm-patch-modal__header">These flights will be removed:</h4>
          <div class="confirm-patch-modal__flight-list">
            <affected-flight
              :flight="flight"
              :key="flight.id"
              v-for="flight in affectedPairs[1]"
            />
          </div>
        </div>
      </div>

      <div class="confirm-patch-modal__wrapper">
        <div class="confirm-patch-modal__content" v-if="affectedShifts.CREATE">
          <h4 class="confirm-patch-modal__header">These shifts will be created:</h4>
          <div class="confirm-patch-modal__flight-list">
            <affected-shift v-for="(shiftChange, idx) in affectedShifts.CREATE"
                            :key="idx"
                            :shift="shiftChange.shift" />
          </div>
        </div>

        <div class="confirm-patch-modal__content" v-if="affectedShifts.UPDATE">
          <h4 class="confirm-patch-modal__header">These shifts will be updated:</h4>
          <div class="confirm-patch-modal__flight-list">
            <affected-shift v-for="shiftChange in affectedShifts.UPDATE"
                            :key="shiftChange.shift.id"
                            :shift="shiftChange.shift" />
          </div>
        </div>
      </div>

      <div class="confirm-patch-modal__btns">
        <el-button size="small" @click="handleCloseModal">Cancel</el-button>
        <el-button type="primary" size="small" @click="$emit('apply')">Apply</el-button>
      </div>
    </card>
  </modal>
</template>

<style lang="scss">
  .confirm-patch-modal {
    &__wrapper {
      display: flex;
      flex-flow: row wrap;
    }

    &__content {
      & + & {
        padding-left: 10px;
      }
    }

    &__header {
      margin-bottom: 10px;
    }

    &__btns {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-top: 20px;
    }

    &__flight-list {
      max-height: 220px;
      overflow: auto;
      margin-bottom: 15px;
    }

    &__template-section {
      margin-bottom: 10px;
    }
  }
</style>
