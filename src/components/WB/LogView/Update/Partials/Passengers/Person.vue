<script>
  import { mapGetters, mapMutations, mapActions } from 'vuex';
  import { numeric, requiredIf } from 'vuelidate/lib/validators';
  import { Popover } from 'element-ui';

  import identity from 'lodash/identity';
  import debounce from 'lodash/debounce';
  import omit from 'lodash/omit';

  import notZeroIf from '../../../../../../validators/notZeroIf';
  import * as consts from '../../../../../../store/modules/wb/consts';

  import { toNumber } from '../updateLogMixin';
  import { passengerFilled, persistentFields } from './helpers';

  import QuantityInput from '../../../../../fields/QuantityInput.vue';
  import Icon from '../../../../../Common/Icon.vue';


  function personProperty(property, mapper = identity) {
    return {
      get() {
        return this.passenger[property];
      },
      set(value) {
        const { passenger } = this;
        const payload = {
          [property]: mapper(value),
        };

        this.previous = null;
        this.updatePassenger({ passenger, payload });
        this.pushPassenger();
      },
    };
  }

  export default {
    props: {
      passenger: {
        type: Object,
        default: () => ({}),
      },
      dragEnabled: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },

    components: {
      QuantityInput,
      Popover,
      Icon,
    },

    data() {
      return {
        previous: null,
      };
    },

    created() {
      this.pushPassenger = debounce(this.pushPassenger, 800);
    },

    computed: {
      ...mapGetters('wb', [
        'detailed',
        'showLockFields',
        'log',

        'getCalcValue',
      ]),

      isRequired() {
        return [
          'weight',
          'lapBag',
          'gateBag',
          'gateBagCount',
          'tsaBag',
          'tsaBagCount',
          'tsaBagWingLocker',
          'tsaBagWingLockerCount',
          'tsaGateBagLocker',
          'tsaGateBagLockerCount',
        ].reduce(
          (required, prop) => (required || this[prop] || this[prop] === 0),
          false,
        );
      },

      dragBadgeClasses() {
        return {
          handle: this.dragEnabled,
          field__badge_disabled: !this.dragEnabled,
        };
      },

      showButtonRow() {
        return this.passengerFilled(this.passenger) || this.previous !== null;
      },

      fullName: personProperty('full_name'),
      weight: personProperty('weight', toNumber),
      lapBag: personProperty('lap_bag', toNumber),
      gateBag: personProperty('gate_bag', toNumber),
      tsaBag: personProperty('tsa_bag', toNumber),
      gateBagCount: personProperty('gate_bag_count', toNumber),
      tsaBagCount: personProperty('tsa_bag_count', toNumber),
      tsaBagWingLocker: personProperty('tsa_bag_wing_locker', toNumber),
      tsaBagWingLockerCount: personProperty('tsa_bag_wing_locker_count', toNumber),
      tsaGateBagLocker: personProperty('gate_bag_wing_locker', toNumber),
      tsaGateBagLockerCount: personProperty('gate_bag_wing_locker_count', toNumber),
    },

    methods: {
      ...mapMutations('wb/passenger', [
        consts.UPDATE_PASSENGER,
      ]),

      ...mapActions('wb/passenger', [
        'updatePassenger',
        'resetPassenger',
      ]),

      pushPassenger() {
        this.$store.dispatch('wb/passenger/pushPassenger', this.passenger);
      },

      reset() {
        this.previous = omit(this.passenger, persistentFields);
        return this.resetPassenger(this.passenger)
          .then(() => this.pushPassenger());
      },

      restore() {
        const { passenger, previous: payload } = this;
        this.previous = null;

        return this.updatePassenger({ passenger, payload })
          .then(() => this.pushPassenger());
      },

      passengerMoment(idx) {
        return this.getCalcValue(`moments.passenger_moments[${idx}]`, 0);
      },

      passengerFilled,
    },

    validations: {
      fullName: {
        requiredIf: requiredIf('isRequired'),
      },
      weight: {
        requiredIf: notZeroIf('fullName'),
        numeric,
      },
      gateBag: {
        notZeroIf: notZeroIf('gateBagCount'),
        numeric,
      },
      tsaBag: {
        notZeroIf: notZeroIf('tsaBagCount'),
        numeric,
      },
      gateBagCount: {
        notZeroIf: notZeroIf('gateBag'),
        numeric,
      },
      tsaBagCount: {
        notZeroIf: notZeroIf('tsaBag'),
        numeric,
      },
      tsaBagWingLocker: {
        notZeroIf: notZeroIf('tsaBagWingLockerCount'),
        numeric,
      },
      tsaBagWingLockerCount: {
        notZeroIf: notZeroIf('tsaBagWingLocker'),
        numeric,
      },
      tsaGateBagLocker: {
        notZeroIf: notZeroIf('tsaGateBagLockerCount'),
        numeric,
      },
      tsaGateBagLockerCount: {
        notZeroIf: notZeroIf('tsaGateBagLocker'),
        numeric,
      },
    },
  };
</script>

<template>
  <tr class="passenger-table__row passenger-table__person" :class="{ 'passenger-table__row_detailed': detailed }">
    <td class="passenger-table__field passenger-table__field_badge">
      <span
        class="field__badge field__badge_desktop field_nowrap"
        :class="dragBadgeClasses"
      >
        <b>S# {{ passenger.seat_number }}</b>
        <icon glyph="user-o"/>
      </span>
      <div
        class="field__badge field__badge_mobile field_nowrap"
        :class="dragBadgeClasses"
      >
        <div class="field__badge_rotate">
          <div class="field__badge_rotate_inner">
            <icon glyph="ellipsis-v"/>
            Seat #{{ passenger.seat_number }}
          </div>
        </div>
      </div>
    </td>

    <td class="passenger-table__field passenger-table__field_full" :class="{ error: $v.fullName.$invalid }">
      <label>First and Last name</label>
      <el-input size="small" v-model="fullName" :disabled="disabled" />
      <span class="form-group__message" v-if="!$v.fullName.requiredIf ">Field is required</span>
    </td>

    <td class="passenger-table__field passenger-table__field_half" :class="{ error: $v.weight.$invalid }">
      <label>Weight</label>
      <el-input size="small" type="tel" class="wb-person__numpad-field" v-model="weight" :disabled="disabled" />
      <span class="form-group__message" v-if="!$v.weight.requiredIf ">Weight is required</span>
      <span class="form-group__message" v-if="!$v.weight.numeric">Weight should be a number</span>
    </td>

    <td class="passenger-table__field passenger-table__field_half">
      <label>Lap Bag</label>
      <el-input size="small" type="tel" class="wb-person__numpad-field" v-model="lapBag" :disabled="disabled" />
    </td>

    <td class="passenger-table__field passenger-table__field_half"
        :class="{ error: $v.gateBagCount.$invalid || $v.gateBag.$invalid }">
      <label>Gate Bag Cabin</label>
      <quantity-input
        :value.sync="gateBag"
        :quantity.sync="gateBagCount"
        :disabled="disabled"
      />
      <span class="form-group__message" v-if="!$v.gateBagCount.notZeroIf">Bag quantity is required</span>
      <span class="form-group__message" v-if="!$v.gateBag.numeric">Weight should be a number</span>
      <span class="form-group__message" v-if="!$v.gateBag.notZeroIf">Bag weight required</span>
    </td>

    <td class="passenger-table__field passenger-table__field_half"
        :class="{ error: $v.tsaBagCount.$invalid || $v.tsaBag.$invalid }">
      <label>TSA Bag Cabin</label>
      <quantity-input
        :value.sync="tsaBag"
        :quantity.sync="tsaBagCount"
        :disabled="disabled"
      />
      <span class="form-group__message" v-if="!$v.tsaBag.numeric">Bag quantity should be a number</span>
      <span class="form-group__message" v-if="!$v.tsaBagCount.notZeroIf">Bag quantity required</span>
      <span class="form-group__message" v-if="!$v.tsaBag.notZeroIf">Bag weight required</span>
    </td>

    <td class="passenger-table__field passenger-table__field_half"
        :class="{ error: $v.tsaGateBagLocker.$invalid || $v.tsaGateBagLockerCount.$invalid }"
        v-if="showLockFields" >
      <label>Gate Bag Wing Locker</label>
      <quantity-input
        :value.sync="tsaGateBagLocker"
        :quantity.sync="tsaGateBagLockerCount"
        :disabled="disabled"
      />
      <span class="form-group__message" v-if="!$v.tsaGateBagLocker.numeric">Bag quantity should be a number</span>
      <span class="form-group__message" v-if="!$v.tsaGateBagLockerCount.notZeroIf">Bag quantity required</span>
      <span class="form-group__message" v-if="!$v.tsaGateBagLocker.notZeroIf">Bag weight required</span>
    </td>

    <td class="passenger-table__field passenger-table__field_half"
        :class="{ error: $v.tsaBagWingLocker.$invalid || $v.tsaBagWingLockerCount.$invalid }"
        v-if="showLockFields">
      <label>TSA Bag Wing Locker</label>
      <quantity-input
        :value.sync="tsaBagWingLocker"
        :quantity.sync="tsaBagWingLockerCount"
        :disabled="disabled"
      />
      <span class="form-group__message" v-if="!$v.tsaBagWingLocker.numeric">Bag quantity should be a number</span>
      <span class="form-group__message" v-if="!$v.tsaBagWingLockerCount.notZeroIf">Bag quantity required</span>
      <span class="form-group__message" v-if="!$v.tsaBagWingLocker.notZeroIf">Bag weight required</span>
    </td>

    <td v-if="detailed" class="passenger-table__field passenger-table__field_full passenger-table__field_mom">
      {{ passengerMoment(passenger.seat_number - 1) }}
    </td>
    <td class="passenger-table__field passenger-table__button" v-if="showButtonRow">
      <icon
        v-if="passengerFilled(passenger)"
        @click="reset"
        class="wb-person__button-icon"
        glyph="times-circle-o"
        size="lg"
        title="Clear row"
        fixed-width
      />
      <icon
        v-else-if="previous !== null"
        @click="restore"
        class="wb-person__button-icon"
        glyph="undo"
        size="lg"
        title="Restore row"
        fixed-width
      />
    </td>
  </tr>
</template>

<style lang="scss" src="../../../../scss/person.scss"></style>
<style lang="scss">
  @import "../numpad-field";

  .wb-person {
    &__numpad-field {
      @include numpad-field;
    }

    &__button-icon {
      cursor: pointer;
      opacity: .6;

      &:hover,
      &:focus {
        opacity: .7;
      }

      &:active {
        opacity: .8;
      }

      &[disabled] {
        opacity: 0.4 !important;
        cursor: not-allowed;
      }
    }
  }
</style>

