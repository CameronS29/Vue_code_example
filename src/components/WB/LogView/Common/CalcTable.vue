<script>
  import { mapGetters } from 'vuex';

  import calcValuesMixin from '../mixins/calcValuesMixin';

  export default {
    mixins: [calcValuesMixin],
    computed: {
      ...mapGetters('wb', [
        'log',
        'detailed',
        'selectedAircraftType',
      ]),
    },
  };
</script>

<template>
  <div v-loading="!isLoaded">
    <div class="calc-table table-wrap">
      <table class="table calc-table__data">
        <thead>
        <tr>
          <td></td>
          <td>Weight</td>
          <td>Forward Limit</td>
          <td>CG</td>
          <td>Aft Limit</td>
          <td v-if="detailed">MOM</td>
        </tr>
        </thead>
        <tbody>
        <tr class="limit-col" v-if="detailed">
          <td>Basic Empty Weight</td>
          <td>{{ getCalcValue('weights.basic_empty_weight', '\u2013') }}</td>
          <td>-</td>
          <td>{{ getCalcValue('moments.basic_empty_cg', '\u2013') }}</td>
          <td>-</td>
          <td>{{ getCalcValue('moments.basic_empty_moment', '\u2013') }}</td>
        </tr>
        <tr class="limit-col" v-if="detailed">
          <td>Pilots Weight</td>
          <td>{{ getCalcValue('weights.pilots_weight', '\u2013') }}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>{{ getCalcValue('moments.pilots_moment', '\u2013') }}</td>
        </tr>
        <tr class="limit-col" v-if="detailed">
          <td>Passengers Weight</td>
          <td>{{ getCalcValue('weights.passengers_weight', '\u2013') }}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>{{ getCalcValue('moments.passengers_moment', '\u2013') }}</td>
        </tr>
        <tr class="limit-col" v-if="detailed">
          <td>Checked Weight</td>
          <td>{{ getCalcValue('weights.total_checked_weight', '\u2013') }}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>{{ getCalcValue('moments.total_checked_moment', '\u2013') }}</td>
        </tr>
        <tr class="limit-col" v-if="detailed">
          <td>Additional Cabin Weight</td>
          <td>{{ getCalcValue('weights.cabinet_weight', '\u2013') }}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>{{ getCalcValue('moments.cabinet_moment', '\u2013') }}</td>
        </tr>
        <tr>
          <td>Zero Fuel Weight</td>
          <td class="value" :class="{'value-invalid': !zeroFuelWeightValid}">
            {{ getCalcValue('weights.zero_fuel_weight', '\u2013') }}
          </td>
          <td class="limit-col"></td>
          <td class="simple-value">
            {{ getCalcValue('moments.zero_fuel_cg', '\u2013') }}
          </td>
          <td class="limit-col"></td>
          <td v-if="detailed">
            {{ getCalcValue('moments.zero_fuel_moment', '\u2013') }}
          </td>
        </tr>

        <tr class="limit-col" v-if="detailed">
          <td>Ramp Fuel</td>
          <td>{{ getCalcValue('weights.ramp_fuel', '\u2013') }}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>{{ getCalcValue('moments.ramp_fuel_moment', '\u2013') }}</td>
        </tr>
        <tr>
          <td>Ramp Weight</td>
          <td class="value" :class="{'value-invalid': !rampWeightValid}">
            {{ getCalcValue('weights.ramp_weight', '\u2013') }}
          </td>
          <td class="limit-col"></td>
          <td class="simple-value">
            {{ getCalcValue('moments.ramp_cg', '\u2013') }}
          </td>
          <td class="limit-col"></td>
          <td v-if="detailed">{{ getCalcValue('moments.ramp_moment', '\u2013') }}</td>
        </tr>

        <tr class="limit-col" v-if="detailed">
          <td>Taxi Fuel</td>
          <td>{{ getCalcValue('weights.taxi_fuel', '\u2013') }}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
        </tr>
        <tr class="limit-col" v-if="detailed">
          <td>Takeoff Fuel</td>
          <td>{{ getCalcValue('weights.takeoff_fuel', '\u2013') }}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>{{ getCalcValue('moments.takeoff_fuel_moment', '\u2013') }}</td>
        </tr>
        <tr>
          <td>Takeoff Weight</td>
          <td class="value" :class="{'value-invalid': !takeOffWeightValid }">
            {{ getCalcValue('weights.takeoff_weight', '\u2013') }}
          </td>
          <td class="limit-col">
            {{ getCalcValue('limits.takeoff_forward_limit', '\u2013') }}
          </td>
          <td class="value" :class="{'value-invalid': !takeoffLimitsValid}">
            {{ getCalcValue('moments.takeoff_cg', '\u2013') }}
          </td>
          <td class="limit-col">
            {{ getCalcValue('limits.takeoff_aft_limit', '\u2013') }}
          </td>
          <td v-if="detailed">
            {{ getCalcValue('moments.takeoff_moment', '\u2013') }}
          </td>
        </tr>

        <tr class="limit-col" v-if="detailed">
          <td>Fuel Burnt</td>
          <td>{{ getCalcValue('weights.burnt_fuel', '\u2013') }}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
        </tr>
        <tr class="limit-col" v-if="detailed">
          <td>Landing Fuel</td>
          <td>{{ getCalcValue('weights.landing_fuel', '\u2013') }}</td>
          <td>-</td>
          <td>-</td>
          <td>-</td>
          <td>{{ getCalcValue('moments.landing_fuel_moment', '\u2013') }}</td>
        </tr>
        <tr>
          <td>Landing Weight</td>
          <td class="value" :class="{'value-invalid': !landingWeightValid}">
            {{ getCalcValue('weights.landing_weight', '\u2013') }}
          </td>
          <td class="limit-col">
            {{ getCalcValue('limits.landing_forward_limit', '\u2013') }}
          </td>
          <td class="value" :class="{'value-invalid': !landingLimitsValid}">
            {{ getCalcValue('moments.landing_cg', '\u2013') }}
          </td>
          <td class="limit-col">
            {{ getCalcValue('limits.landing_aft_limit', '\u2013') }}
          </td>
          <td v-if="detailed">{{ getCalcValue('moments.landing_moment', '\u2013') }}</td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="wb-calc-table__alert">
      <el-alert v-if="validate && !isValid" type="error" title="" class="error" :closable="false">
        <p class="wb-calc-table__error-title">
          Weight must be adjusted, so that no weights are in red, confirming the weight and balance of
          the aircraft is balanced:
        </p>

        <ul class="wb-calc-table__error-list">
          <li v-if="!zeroFuelWeightValid">
            Zero Fuel weight for <b>{{ selectedAircraftType.name }}</b>
            cannot exceed <b>{{ getCalcValue('weights.max_zero_fuel_weight', '\u2013') }} lbs</b>.
          </li>

          <li v-if="!rampWeightValid">
            Maximum ramp weight allowed for <b>{{ selectedAircraftType.name }}</b>
            is <b>{{ getCalcValue('weights.max_ramp_weight', '\u2013') }} lbs</b>.
          </li>

          <li v-if="!takeOffWeightValid">
            Maximum takeoff weight allowed for <b>{{ selectedAircraftType.name }}</b>
            is <b>{{ getCalcValue('weights.max_takeoff_weight', '\u2013') }} lbs</b>.
          </li>

          <li v-if="!landingWeightValid">
            Landing weight for <b>{{ selectedAircraftType.name }}</b>
            cannot exceed <b>{{ getCalcValue('weights.max_landing_weight', '\u2013') }} lbs</b>.
          </li>
          <li v-if="!isCGValid">
            CG is out of limits, please correct your load to bring the CG within envelope.
          </li>
        </ul>
      </el-alert>
    </div>
  </div>
</template>

<style lang="scss">
  .row-label {
    background: #f6f6f6;
    font-weight: bold;
    text-align: center;

  }
  .calc-table .errors {
    padding: 0 10px;
  }
  .limit-col {
    background: #f6f6f6;
    color: #acadae;
  }

  .calc-table {
    .simple-value {
      color: #acadae;
    }

    .value {
      font-weight: bold;
      color: #00B792;

      &.value-invalid {
        color: #DF0151;
      }
    }

    &__data {
      margin-bottom: 0;
    }
  }
  .table-wrap{
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .wb-calc-table {
    &__error-list {
      margin-top: 10px;
      padding-left: 20px;
    }

    &__alert {
      margin-top: 15px;
    }
  }
</style>
