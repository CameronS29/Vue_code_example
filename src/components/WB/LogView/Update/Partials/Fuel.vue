<script>
  import { mapGetters } from 'vuex';
  import { and, or, requiredIf } from 'vuelidate/lib/validators';

  import updateLogMixin, { logProperty, toNumber } from './updateLogMixin';

  import notZeroIf from '../../../../../validators/notZeroIf';
  import greaterThan from '../../../../../validators/greaterThan';
  import lessThanProp from '../../../../../validators/lessThanProp';

  export default {
    mixins: [updateLogMixin],

    computed: {
      ...mapGetters('wb', [
        'selectedAircraft',
        'selectedAircraftType',
        'validate',
      ]),

      fuelOnBoardMainsMax() {
        return this.selectedAircraftType.mfobm_max;
      },
      fuelBurnMax() {
        return this.selectedAircraftType.fuel_burn_max;
      },
      fuelOnBoardAuxMax() {
        return this.selectedAircraftType.mfoba_max;
      },

      fuelOnBoardMains: logProperty('fuel_on_board_mains', toNumber),
      fuelBurn: logProperty('fuel_born', toNumber),
      fuelOnBoardAux: logProperty('fuel_on_board_aux', toNumber),

      fuelOnBoardTotal() {
        return Number(this.fuelOnBoardMains) + Number(this.fuelOnBoardAux);
      },

      remainingLoad() {
        return this.getCalcValue('weights.remaining_useful_load');
      },
    },

    validations: {
      fuelOnBoardMains: {
        notZero: notZeroIf('validate'),
        greaterThan: greaterThan(0),
        lessThanProp: lessThanProp('fuelOnBoardMainsMax'),
      },
      fuelOnBoardAux: {
        required(value) {
          return (
            (this.selectedAircraftType.name !== 'BE300' || !this.validate) ||
            (value !== null && value >= 0)
          );
        },
        lessThanProp: lessThanProp('fuelOnBoardAuxMax'),
      },
      fuelBurn: {
        notZero: notZeroIf('validate'),
        required: and(
          notZeroIf('fuelOnBoardMains'),
          notZeroIf('fuelOnBoardAux'),
        ),
        greaterThan: greaterThan(-Number.EPSILON),
        lessThanProp: and(
          lessThanProp('fuelBurnMax'),
          lessThanProp('fuelOnBoardTotal'),
        ),
      },
    },
  };
</script>

<template>
  <div class="panel panel-body col-sm-12">
    <div class="fuel-values">
      <div class="form-group" :class="{ error: $v.fuelOnBoardMains.$invalid }">
        <label class="control-label">Fuel On Board (Mains)</label>
        <el-input
          type="tel"
          class="wb-fuel__numpad-field"
          placeholder="Fuel on board mains"
          v-model="fuelOnBoardMains"
          :disabled="disabled"
        />
      </div>
      <div class="form-group"
           v-if="selectedAircraft.show_fuel_on_board_aux"
           :class="{ error: $v.fuelOnBoardAux.$invalid }">
        <label class="control-label">Fuel On Board (Aux)</label>
        <el-input
          type="tel"
          class="wb-fuel_numpad-field"
          v-model="fuelOnBoardAux"
          :disabled="disabled"
        />
      </div>
      <div class="form-group" :class="{ error: $v.fuelBurn.$invalid }">
        <label class="control-label">Fuel Burn</label>
        <el-input
          type="tel"
          class="wb-fuel_numpad-field"
          v-model="fuelBurn"
          :disabled="disabled"
        />
      </div>
    </div>
    <div class="row" v-if="remainingLoad">
      <div class="col-sm-12">
        <div class="calc-label"
             :class="{'calc-label-positive': remainingLoad > 0,
                      'calc-label-negative': remainingLoad <= 0}">
          Remaining Useful Load: <strong>{{ remainingLoad }}</strong>
        </div>
      </div>
    </div>

    <div class="alert alert-danger error wb-fuel-alert" role="alert" v-if="$v.$invalid && validate">
      <ul class="wb-fuel-alert__list">
        <li v-if="!$v.fuelOnBoardMains.notZero"><b>Fuel On Board (Mains)</b> should not be empty.</li>
        <li v-if="!$v.fuelOnBoardAux.notZero"><b>Fuel On Board (Aux)</b> should not be empty.</li>

        <li v-if="!$v.fuelOnBoardMains.lessThanProp">
          <b>Fuel On Board (Mains)</b> value should be less than <b>{{ fuelOnBoardMainsMax }} lbs</b>
        </li>
        <li v-if="!$v.fuelOnBoardAux.lessThanProp">
          <b>Fuel On Board (Aux)</b> value should be less than <b>{{ fuelOnBoardAuxMax }} lbs</b>
        </li>
        <li v-if="!$v.fuelBurn.notZero"><b>Fuel Burn</b> should not be empty.</li>
        <li v-if="!$v.fuelBurn.lessThanProp">
          <b>Fuel Burn</b>
          value should be less than Fuel on board
          <b>({{ Math.min(fuelBurnMax, fuelOnBoardTotal) }} lbs)</b>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
  @import "numpad-field";

  .fuel-values {
    display: flex;
    flex-flow: row wrap;
    margin-bottom: 10px;

    .form-group {
      min-width: 68px;
      display: flex;
      flex-flow: column nowrap;
      flex: 1 1;

      padding: 5px;
      margin-bottom: 5px;

      &.error {
        margin-bottom: 4px;
      }

      label {
        flex: 1 0;
      }

      &:not(:last-child){
        margin-right: 10px;
      }
    }
  }

  .wb-fuel_numpad-field {
    @include numpad-field;
  }

  .wb-fuel-alert {
    margin-top: 15px;
    margin-bottom: 0;

    &__list {
      padding-left: 15px;

      li {
        margin-top: 5px;

        &:first-child {
          margin-top: 0;
        }
      }
    }
  }
</style>
