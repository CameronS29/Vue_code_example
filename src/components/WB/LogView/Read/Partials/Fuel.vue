<script>
  import { mapGetters } from 'vuex';

  export default {
    computed: {
      ...mapGetters("wb", [
        "log",
        "selectedAircraft",
        'getCalcValue'
      ]),

      remainingLoad() {
        return this.getCalcValue('weights.remaining_useful_load');
      },
    },
  };
</script>

<template>
  <div class="panel panel-body wb-fuel">
    <div class="fuel-values">
      <div class="form-group" >
        <label class="control-label">Fuel On Board (Mains)</label>
        {{ log.fuel_on_board_mains }}
      </div>
      <div class="form-group" v-if="selectedAircraft.show_fuel_on_board_aux">
        <label class="control-label">Fuel On Board (Aux)</label>
        {{ log.fuel_on_board_aux }}
      </div>
      <div class="form-group" >
        <label class="control-label">Fuel Burn</label>
        {{ log.fuel_born }}
      </div>
    </div>
    <div class="row" v-if="remainingLoad !== undefined">
      <div class="col-sm-12">
        <div
          class="calc-label"
          :class="{'calc-label-positive': remainingLoad > 0,
                   'calc-label-negative': remainingLoad <= 0}"
        >
          Remaining Useful Load: <strong>{{ remainingLoad }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .fuel-values {
    display: flex;
    flex-flow: row wrap;
    margin-bottom: 10px;

    .form-group {
      min-width: 68px;
      display: flex;
      flex-flow: column nowrap;
      flex: 1 1;
      margin-right: 10px;
      margin-bottom: 0;

      label { flex: 1 0; }

      &:last-child {
        margin-right: 0;
      }
    }
  }
</style>
