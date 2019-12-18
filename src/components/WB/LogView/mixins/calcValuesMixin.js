import { mapGetters } from 'vuex';
import { isFinite, every } from 'lodash';

export default {
  computed: {
    ...mapGetters('wb', [
      'log',
      'isLoading',
      'calculations',
      'validate',
      'cgLimits',

      'getCalcValue',
    ]),

    polygon() {
      return this.cgLimits.map(point => [point.cg, point.cg_weight]);
    },

    zeroFuelWeightValid() {
      const zeroFuelWeight = this.getCalcValue('weights.zero_fuel_weight', -1);
      const maxZeroFuel = this.getCalcValue('weights.max_zero_fuel_weight', 0);
      return zeroFuelWeight <= maxZeroFuel;
    },

    rampWeightValid() {
      const rampWeight = this.getCalcValue('weights.ramp_weight', -1);
      const maxRampWeight = this.getCalcValue('weights.max_ramp_weight', 0);
      return rampWeight <= maxRampWeight;
    },

    takeOffWeightValid() {
      const takeOffWeight = this.getCalcValue('weights.takeoff_weight', -1);
      const maxTakeOff = this.getCalcValue('weights.max_takeoff_weight', 0);
      return takeOffWeight <= maxTakeOff;
    },

    takeoffLimitsValid() {
      const takeoffCG = this.getCalcValue('moments.takeoff_cg', 0);
      const fwdLimit = this.getCalcValue('limits.takeoff_forward_limit', -1);
      const aftLimit = this.getCalcValue('limits.takeoff_aft_limit', 1);
      return fwdLimit <= takeoffCG && takeoffCG <= aftLimit;
    },

    takeOffValid() {
      return (
        this.takeOffWeightValid
        && this.takeoffLimitsValid
      );
    },

    landingWeightValid() {
      const landingWeight = this.getCalcValue('weights.landing_weight', -1);
      const maxLandingWeight = this.getCalcValue('weights.max_landing_weight', 0);
      return landingWeight < maxLandingWeight;
    },

    landingLimitsValid() {
      const landingCG = this.getCalcValue('moments.landing_cg', 0);
      const fwdLimit = this.getCalcValue('limits.landing_forward_limit', -1);
      const aftLimit = this.getCalcValue('limits.landing_aft_limit', 1);
      return fwdLimit <= landingCG && landingCG <= aftLimit;
    },

    landingValid() {
      return (
        this.landingWeightValid
        && this.landingLimitsValid
      );
    },


    isWeightValid() {
      return (
        this.zeroFuelWeightValid
        && this.rampWeightValid
        && this.takeOffWeightValid
        && this.landingWeightValid
      );
    },

    isCGValid() {
      return this.takeoffLimitsValid && this.landingLimitsValid;
    },

    isValid() {
      return this.isWeightValid && this.isCGValid;
    },

    isLoaded() {
      const affectedProps = [
        this.log.id,
        this.calculations,
        this.cgLimits[0],
      ];

      return every(affectedProps) && !this.isLoading;
    }
  },

  filters: {
    fixed(value, precision = 0) {
      const numeric = parseFloat(value);
      return isFinite(numeric)
        ? numeric.toFixed(precision)
        : '\u2013';
    },
  },
};
