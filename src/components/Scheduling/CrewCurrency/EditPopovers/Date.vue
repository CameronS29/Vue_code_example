<script>
  import { mapActions, mapMutations, mapState } from 'vuex';
  import { DateTime } from 'luxon';
  import { isUndefined } from 'lodash';

  import Popover from 'Common/Popover.vue';
  import { UNIT_DAY, UNIT_MONTH, UNIT_NAMES, UNIT_YEAR } from 'store/modules/scheduling/crewCurrency';

  export default {
    components: {
      Popover,
    },
    props: {
      pilot: {
        type: Object,
        required: true,
      },
      type: {
        type: Object,
        required: true,
      },
    },
    data() {
      return {
        date: null,
        UNIT_DAY,
        UNIT_MONTH,
        UNIT_YEAR,
        UNIT_NAMES,
      };
    },
    computed: {
      ...mapState('scheduling/crewCurrency', [
        'editPopover',
      ]),
      propName() {
        return this.type.currency_meta.key_name;
      },
      propValue() {
        return this.pilot.pilot.currency[this.propName];
      },
      hasRange() {
        return !isUndefined(this.type.currency_meta.unit_type) && this.type.currency_meta.unit_range;
      },
      currentUntil() {
        if (!this.hasRange || !this.propValue) return null;

        const date = DateTime.fromISO(this.propValue);
        const key = UNIT_NAMES[this.type.currency_meta.unit_type];


        return this.format(date.plus({ [key]: this.type.currency_meta.unit_range }).toISODate());
      },
      lastSelected() {
        if (!this.hasRange || !this.propValue) return null;

        return this.format(DateTime.fromISO(this.propValue).toISODate());
      },
    },
    methods: {
      ...mapMutations('scheduling/crewCurrency', [
        'setEditPopoverProps',
        'clearEditPopoverProps',
      ]),
      ...mapActions('scheduling/crewCurrency', [
        'patchProp',
      ]),
      format(value) {
        const format = this.type.currency_meta.unit_type === UNIT_MONTH ? 'MMMM yyyy' : 'DDD';

        return value
          ? DateTime.fromISO(value)
            .toFormat(format)
          : '';
      },
      handleClick() {
        this.setEditPopoverProps({
          pilotId: this.pilot.id,
          key: this.propName,
        });
      },
      clearEditProps() {
        this.clearEditPopoverProps();
      },
      handleSave() {
        this.patchProp({
          pilotId: this.pilot.id,
          key: this.propName,
          value: DateTime.fromJSDate(this.date)
            .toISODate(),
        });
      },
      selectToday() {
        this.date = DateTime.local()
          .toJSDate();
      },
      selectYesterday() {
        this.date = DateTime.local()
          .minus({ days: 1 })
          .toJSDate();
      },
    },
  };
</script>

<template>
  <popover
    :element-props="{ width: 300 }"
    placeholder-class="currency-boolean__pop-placeholder" @hide="clearEditProps">
    <div class="currency-date__current" v-if="currentUntil">
      <div class="currency-date__left">Current until</div>
      <div class="currency-date__right">{{ currentUntil }}</div>
    </div>
    <div class="currency-date__last-selected" v-if="lastSelected">
      <div class="currency-date__left">Last selected</div>
      <div class="currency-date__right">{{ lastSelected }}</div>
    </div>
    <div class="currency-date__next">
      <div class="currency-date__left">New record</div>
      <div class="currency-date__right">
        <el-date-picker
          class="currency-date__picker"
          v-model="date" :type="type.currency_meta.unit_type === UNIT_MONTH ? 'month' : 'date'" />
        <div class="currency-date__fast-selection">
          <a @click.prevent="selectToday">today</a>
          <a @click.prevent="selectYesterday">yesterday</a>
        </div>
      </div>
    </div>
    <el-button class="currency-date__submit" size="mini" @click="handleSave" type="primary">Save</el-button>
  </popover>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .currency-date {
    position: relative;
    display: inline-block;

    &__current {
      font-size: 12px;
      color: $yellow;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
    }

    &__last-selected {
      font-size: 12px;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      font-weight: bold;
    }

    &__next {
      font-size: 12px;
      margin-bottom: 10px;
      display: flex;
    }

    &__left {
      flex: 0 0 100px;
    }

    &__right {
      flex: 1 1;
    }

    &__submit {
      margin-left: 100px;
    }

    &__picker {
      width: 100% !important;
    }

    &__fast-selection {
      margin-top: 2px;
      > * {
        margin-right: 5px;
      }
    }

    &__pop-placeholder {
      pointer-events: none;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
  }
</style>
