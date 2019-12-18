<script>
  import { mapGetters, mapMutations, mapState } from 'vuex';
  import { isUndefined } from 'lodash';
  import { DateTime } from 'luxon';
  import {
    CURRENCY_BOOL_CONNECTED,
    CURRENCY_BOOLEAN,
    CURRENCY_NUMERIC,
    CURRENCY_PERIOD,
    CURRENCY_PERIODIC,
    CURRENCY_VARIATIVE,
    THRESHOLD_OK,
    THRESHOLD_NEAR,
    THRESHOLD_GRACE,
    THRESHOLD_CRITICAL,
    UNIT_MONTH,
    UNIT_NAMES,
  } from 'store/modules/scheduling/crewCurrency';

  import BooleanPopover from './EditPopovers/Boolean.vue';
  import NumericPopover from './EditPopovers/Numeric.vue';
  import DatePopover from './EditPopovers/Date.vue';
  import VariativePopover from './EditPopovers/Variative.vue';

  export default {
    props: {
      type: {
        type: Object,
        required: true,
      },
      row: {
        type: Object,
        required: true,
      },
    },
    components: {
      BooleanPopover,
      NumericPopover,
      DatePopover,
      VariativePopover,
    },
    computed: {
      ...mapGetters('scheduling/crewCurrency', [
        'typeByCurrencyId',
      ]),
      ...mapState('scheduling/crewCurrency', [
        'editPopover',
      ]),
      propName() {
        return this.type.currency_meta.key_name;
      },
      currency() {
        return {
          ...this.row.pilot.currency,
          ...this.row.pilot.currency_today,
        }
      },
      value() {
        return this.currency[this.propName];
      },
      periodicFormattedValue() {
        const format = this.type.currency_meta.unit_type === UNIT_MONTH ? 'MMMM yyyy' : 'DDD';

        return this.value
          ? this.dueDate.toFormat(format)
          : '';
      },
      variativeFormattedValue() {
        return this.value || '';
      },
      numericFormattedValue() {
        return this.value;
      },
      isCurrentPropEdit() {
        return this.editPopover.pilotId
          && (this.editPopover.pilotId === this.row.id)
          && (this.editPopover.key === this.propName);
      },
      showBoolean() {
        if (this.type.currency_type === CURRENCY_BOOLEAN) return true;
        return this.type.currency_type === CURRENCY_BOOL_CONNECTED;

      },
      booleanIconClasses() {
        return {
          fa: true,
          'crew-type-column__boolean': true,
          'fa-check': this.value,
          'fa-times': !this.value,
        };
      },
      booleanLabelClasses() {
        return {
          'crew-type-column__cell': true,
          'crew-type-column__boolean': true,
          'crew-type-column__positive-label': this.value,
          'crew-type-column__negative-label': !this.value,
        };
      },
      periodicLabelClasses() {
        return {
          'crew-type-column__cell': true,
          'crew-type-column__active-string': true,
          [this.warningClass]: !!this.warningClass,
        };
      },
      variativeLabelClasses() {
        return {
          'crew-type-column__cell': true,
          'crew-type-column__active-string': true,
        };
      },
      numericLabelClasses() {
        return {
          'crew-type-column__cell': true,
          'crew-type-column__active-string': this.type.currency_meta.editable,
          'crew-type-column__string': !this.type.currency_meta.editable,
        };
      },
      hasRange() {
        return !isUndefined(this.type.currency_meta.unit_type) && this.type.currency_meta.unit_range;
      },
      dueDate() {
        const date = DateTime.fromISO(this.value);
        const unitKey = UNIT_NAMES[this.type.currency_meta.unit_type];
        return date.plus({ [unitKey]: this.type.currency_meta.unit_range });
      },
      warningClass() {
        if (!this.hasRange || !this.value) return undefined;

        const currentDate = DateTime.local();
        const unit = this.type.currency_meta.unit_type === UNIT_MONTH ? 'months' : 'days';
        const diff = this.dueDate.diff(currentDate, unit)[unit];
        const thresholds = this.type.currency_meta.threshold_levels;
        if (diff < thresholds[THRESHOLD_CRITICAL]) {
          return 'crew-type-column__cell_red';
        } else if (thresholds[THRESHOLD_GRACE] !== null && diff < thresholds[THRESHOLD_GRACE]) {
          return 'crew-type-column__cell_orange';
        } else if (diff < thresholds[THRESHOLD_NEAR]) {
          return 'crew-type-column__cell_yellow';
        } else if (diff < thresholds[THRESHOLD_OK]) {
          return 'crew-type-column__cell_green';
        }
      },
      isDefaultBoolLabels() {
        return (this.type.currency_meta.no_label === 'NO_CHECK') && (this.type.currency_meta.yes_label === 'YES_CHECK');
      },
    },
    methods: {
      ...mapMutations('scheduling/crewCurrency', [
        'setEditPopoverProps',
      ]),
      handleClick() {
        if ((this.type.currency_type === CURRENCY_NUMERIC) && !this.type.currency_meta.editable) return;

        this.setEditPopoverProps({
          pilotId: this.row.id,
          key: this.propName,
        });
      },
    },
    data() {
      return {
        CURRENCY_BOOL_CONNECTED,
        CURRENCY_BOOLEAN,
        CURRENCY_PERIOD,
        CURRENCY_PERIODIC,
        CURRENCY_VARIATIVE,
        CURRENCY_NUMERIC,
      };
    },
  };
</script>

<template>
  <div class="crew-type-column">
    <div v-if="showBoolean && value !== null" :class="booleanLabelClasses" @click="handleClick">
      <i v-if="isDefaultBoolLabels" :class="booleanIconClasses" />
      <span v-else-if="value !== null">{{ value ? type.currency_meta.yes_label : type.currency_meta.no_label }}</span>
      <!--<boolean-popover :pilot="row"-->
                       <!--:type="type"-->
                       <!--v-if="isCurrentPropEdit" />-->
    </div>

    <div
      :class="periodicLabelClasses"
      @click="handleClick"
      v-if="type.currency_type === CURRENCY_PERIODIC">
      {{ periodicFormattedValue }}
      <date-popover :pilot="row"
                    :type="type"
                    v-if="isCurrentPropEdit" />
    </div>

    <div @click="handleClick"
         :class="variativeLabelClasses"
         v-if="type.currency_type === CURRENCY_VARIATIVE">
      {{ variativeFormattedValue }}
      <variative-popover :pilot="row"
                         :type="type"
                         v-if="isCurrentPropEdit" />
    </div>

    <div @click="handleClick"
         :class="numericLabelClasses"
         v-if="type.currency_type === CURRENCY_NUMERIC">
      {{ numericFormattedValue }}
      <numeric-popover :pilot="row"
                       :type="type"
                       v-if="isCurrentPropEdit" />
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .crew-type-column {
    height: 100%;
    position: relative;
    display: flex;

    &__cell {
      padding: 2px 5px;
      flex: 1 1;
      height: 24px;
      &_red {
        background-color: transparentize($red, 0.7);
      }

      &_orange {
        background-color: transparentize($orange, 0.6);
      }

      &_yellow {
        background-color: transparentize($yellow, 0.8);
      }

      &_green {
        background-color: transparentize($navy, 0.7);
      }
    }

    &__boolean {
      text-align: center;
      cursor: pointer;
    }

    .fa-check {
      color: $navy;
      font-size: 16px;
    }
    .fa-times {
      color: $red;
      font-size: 16px;
    }

    &__positive-label {
      color: $navy;
    }

    &__negative-label {
      color: $red;
    }

    &__active-string {
      cursor: pointer;
    }
  }
</style>
