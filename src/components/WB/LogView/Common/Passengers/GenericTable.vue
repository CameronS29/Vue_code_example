<script>
  import { mapGetters, mapActions } from 'vuex';
  import { round } from 'lodash';
  import lessThanProp from '../../../../../validators/lessThanProp';

  import AdjustWarning from './AdjustWarning.vue';
  import CalcBar from '../CalcBar.vue';

  export default {
    props: {
      wbid: [Number, String],
    },

    components: {
      CalcBar,
      AdjustWarning,
    },

    created() {
      this.receivePassengers(this.wbid);
    },

    computed: {
      ...mapGetters('wb/passenger', ['sortedPassengers']),
      ...mapGetters('wb', [
        'detailed',
        'selectedAircraft',
        'selectedAircraftType',
        'showLockFields',
        'log',
        'getCalcValue',
      ]),

      tableClasses() {
        return {
          'passenger-table': true,
          'passenger-table_lock-fields': this.showLockFields,
        };
      },
      totalChecked() {
        return this.getCalcValue('weights.checked_weight', 0);
      },

      totalCheckedMoment() {
        return this.getCalcValue('moments.checked_moment', 0);
      },

      totalCabin() {
        const cabinSum = this.getCalcValue('weights.pilots_weight', 0)
          + this.getCalcValue('weights.passengers_weight', 0);
        return round(cabinSum, 3);
      },

      totalCabinMoment() {
        const cabinSum = this.getCalcValue('moments.pilots_moment', 0)
          + this.getCalcValue('moments.passengers_moment', 0);

        return round(cabinSum, 3);
      },

      totalCheckedLimit() {
        return this.selectedAircraftType ? this.selectedAircraftType.mtcw : 0;
      },

      totalWing1() {
        return this.getCalcValue('weights.gate_bags_wing_locker_weight', 0);
      },

      totalWing2() {
        return this.getCalcValue('weights.tsa_bags_wing_locker_weight', 0);
      },

      totalWing1Limit() {
        return this.selectedAircraftType
          ? this.selectedAircraftType.mtwl1
          : 0;
      },

      totalWing2Limit() {
        return this.selectedAircraftType
          ? this.selectedAircraftType.mtwl2
          : 0;
      },
    },

    methods: mapActions('wb/passenger', ['receivePassengers']),

    validations: {
      totalChecked: {
        lessThanProp: lessThanProp('totalCheckedLimit'),
      },
      totalWing1: {
        lessThanProp: lessThanProp('totalWing1Limit'),
      },
      totalWing2: {
        lessThanProp: lessThanProp('totalWing2Limit'),
      },
    },
  };
</script>

<template>
  <div class="wb-generic-passengers" v-loading="sortedPassengers.length <= 0">
    <adjust-warning/>
    <table :class="tableClasses">
      <thead class="passenger-table__head" :class="{detailed}">
        <tr class="passenger-table__row">
          <th class="passenger-table__cell passenger-table__badge" />
          <th class="passenger-table__cell passenger-table__name">First and Last name</th>
          <th class="passenger-table__cell passenger-table__weight">Passenger Weight</th>
          <th class="passenger-table__cell passenger-table__bag passenger-table__bag_lap">Lap Bag</th>
          <th class="passenger-table__cell passenger-table__bag passenger-table__bag_cabin">Gate Bag <br> Cabin</th>
          <th class="passenger-table__cell passenger-table__bag passenger-table__bag_cabin">TSA Bag <br> Cabin</th>
          <th class="passenger-table__cell passenger-table__bag passenger-table__bag_locker" v-if="showLockFields">Gate Bag<br>Wing Locker</th>
          <th class="passenger-table__cell passenger-table__bag passenger-table__bag_locker" v-if="showLockFields">TSA Bag<br>Wing Locker</th>
          <th class="passenger-table__cell" v-if="detailed">MOM</th>
        </tr>
      </thead>

      <slot />

      <tbody
        class="passenger-table__body passenger-calculations"
        :class="{'calc-lock': this.showLockFields}"
        v-if="this.selectedAircraft"
      >
        <tr class="passenger-table__row">
          <slot name="action-buttons">
            <td />
          </slot>

          <td class="passenger-table__progress-cell" colspan="3">
            <calc-bar v-if="detailed" :value="totalCabinMoment" label="Total Cabin Moment" />
            <calc-bar :value="totalCabin" label="Total Cabin" />
          </td>

          <td class="passenger-table__progress-cell" colspan="2">
            <calc-bar v-if="detailed" :value="totalCheckedMoment" label="Total Checked Moment" />
            <calc-bar :value="totalChecked" :limit="totalCheckedLimit" label="Total Checked" />
          </td>

          <td class="passenger-table__progress-cell" v-if="showLockFields">
            <calc-bar
              :value="totalWing1"
              :limit="totalWing1Limit"
              label="Wing Locker 1"
            />
          </td>

          <td class="passenger-table__progress-cell" v-if="showLockFields">
            <calc-bar
              :value="totalWing2"
              :limit="totalWing2Limit"
              label="Wing Locker 2"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <el-alert class="error" v-if="$v.$invalid" title="Passenger Errors" :closable="false">
      <ul class="passenger-table__error-list">
        <li v-if="!$v.totalChecked.lessThanProp">
          Total checked value value should be less than {{ totalCheckedLimit }} lbs;
        </li>
        <li v-if="!$v.totalWing1.lessThanProp">
          Total checked Wing 1 value value should be less than {{ totalWing1Limit }} lbs;
        </li>
        <li v-if="!$v.totalWing2.lessThanProp">
          Total checked Wing 2 value value should be less than {{ totalWing2Limit }} lbs;
        </li>
      </ul>
    </el-alert>
  </div>
</template>

<style lang="scss">
  @import '../../../../../../scss/bs-variables';

  .wb-generic-passengers {
    position: relative;
  }

  .wb-passenger-table {
    &__header {
      display: flex;
      justify-content: space-between;
    }
  }

  .passenger-table {
    width: 100%;

    &__head {
      .passenger-table__cell {
        font-weight: bold;
        vertical-align: middle;
      }
    }

    &__cell,
    &__field {
      vertical-align: top;
      padding: 6px 3px;
      min-width: 50px;

      &_mom {
        line-height: 32px;
        padding-left: 6px;
        padding-right: 6px;
      }
    }

    &__progress-cell {
      vertical-align: top;
      padding-top: 6px;
    }

    &__error-list {
      padding-left: 19px;
    }

    &__name {
      width: 30%;
    }

    &__weight {
      width: 20%;
    }

    &__bag {
      max-width: 15%;

      &_lap {
        min-width: 70px;
      }

      &_cabin,
      &_locker {
        min-width: 90px;
      }
    }
  }

  .passenger-calculations {
    &__sort {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
  }

  @media screen and (max-width: $screen-sm-max) {
    .passenger-table {
      display: block;
      width: 100%;

      &__row {
        padding: 10px 10px 10px 35px;
      }

      &__head {
        display: none;
      }

      &__body,
      &__cell,
      &__field,
      &__row {
        display: block;
      }
    }

    .passenger-calculations {
      &__sort {
        display: flex;
        margin: 0 -10px 0 0;
      }

      &__sort-button {
        flex: 1 1 50%;
        width: 100%;
        padding: 0 10px 0 0;
      }
    }
  }

  @media screen and (max-width: $screen-xs-max) {
    .passenger-calculations {
      &__sort {
        flex-wrap: wrap;
      }

      &__sort-button {
        margin-top: 10px;
        flex: 1 1 100%;

        &:first-child {
          margin-top: 0;
        }
      }
    }
  }
</style>
