<script>
  import { mapGetters } from 'vuex';
  import Card from 'Common/Card.vue';

  export default {
    name: 'Load',

    components: {
      Card,
    },

    computed: {
      ...mapGetters('wb', [
        'log',
        'selectedAircraft',
        'selectedAircraftType',
        'getCalcValue',
      ]),

      remainingLoad() {
        return this.getCalcValue('weights.remaining_useful_load');
      },
    },
  };
</script>

<template>
  <card title="Load" class="wb-confirm-modal__load wb-confirm-load">
    <div class="wb-confirm-load__field" :class="{ 'wb-confirm-load__field_invalid': log.fuel_on_board_mains === null }">
      <span class="wb-confirm-load__label">Fuel On Board (Mains)</span>
      <span class="wb-confirm-load__value">{{ log.fuel_on_board_mains || '&ndash;' }}</span>
    </div>

    <div class="wb-confirm-load__field" v-if="selectedAircraft && selectedAircraft.show_fuel_on_board_aux">
      <span class="wb-confirm-load__label">Fuel On Board (Aux)</span>
      <span class="wb-confirm-load__value">{{ log.fuel_on_board_aux || '&ndash;' }}</span>
    </div>

    <div class="wb-confirm-load__field" :class="{ 'wb-confirm-load__field_invalid': log.fuel_born === null }">
      <span class="wb-confirm-load__label">Fuel Burn</span>
      <span class="wb-confirm-load__value">{{ log.fuel_born || '&ndash;' }}</span>
    </div>

    <div class="wb-confirm-load__field">
      <span class="wb-confirm-load__label">Max. Takeoff Weight</span>
      <span class="wb-confirm-load__value">{{ getCalcValue('weights.max_takeoff_weight', '&ndash;') }}</span>
    </div>

    <div class="wb-confirm-load__field">
      <span class="wb-confirm-load__label">Basic Empty Weight</span>
      <span class="wb-confirm-load__value">{{ getCalcValue('weights.basic_empty_weight', '&ndash;') }}</span>
    </div>

    <div class="wb-confirm-load__field">
      <span class="wb-confirm-load__label">CG</span>
      <span class="wb-confirm-load__value">{{ getCalcValue('moments.basic_empty_cg', '&ndash;') }}</span>
    </div>

    <div class="wb-confirm-load__field">
      <span class="wb-confirm-load__label">TSA Bags</span>
      <span class="wb-confirm-load__value">{{ getCalcValue('totals.tsa_checked_bags', 0) }}</span>
    </div>

    <div class="wb-confirm-load__field">
      <span class="wb-confirm-load__label">Gate Bags</span>
      <span class="wb-confirm-load__value">{{ getCalcValue('totals.gate_checked_bags', 0) }}</span>
    </div>

    <div
      class="wb-confirm-load__field wb-confirm-load__field_main"
      :class="{ 'wb-confirm-load__field_valid': remainingLoad > 0,
                'wb-confirm-load__field_invalid': remainingLoad <= 0, }"
    >
      <span class="wb-confirm-load__label">Remaining Useful Load</span>
      <span class="wb-confirm-load__value">{{ remainingLoad || '&ndash;' }}</span>
    </div>
  </card>
</template>

<style lang="scss" scoped>
  @import "../../../../../../scss/bs-variables";

  .wb-confirm-load {
    &__label {
      flex: 1 1 80%;
      padding-right: 10px;
    }

    &__value {
      font-weight: bold;
      flex: 1 0 20%;
      align-self: baseline;
    }

    &__field {
      display: flex;
      flex-flow: row nowrap;
      margin: 3px 0;

      &_main {
        padding-top: 14px;
        font-weight: 500;
        font-size: 1.2em;
      }

      &_valid { color: $navy; }
      &_invalid { color: $red; }
    }
  }
</style>
