<script>
  import { DateTime } from 'luxon';
  import { mapState, mapGetters, mapMutations } from 'vuex';

  import FixedOffsetZone from 'luxon/src/zones/fixedOffsetZone';
  import LocalZone from 'luxon/src/zones/localZone';
  import { SET_EDITABLE_RESERVE_SHIFT, TRAVEL_TYPE_ID } from 'store/modules/scheduling/consts';
  import { vuexProperty } from 'utils/helpers';

  const formProp = vuexProperty({
    attr: 'travelForm',
    mutation: SET_EDITABLE_RESERVE_SHIFT,
  });

  const toInternalValue = date => (
    date && DateTime.fromJSDate(date)
      .setZone(FixedOffsetZone.utcInstance, { keepLocalTime: true })
      .toISO()
  );

  const toFormValue = date => (
    date && DateTime.fromISO(date, { setZone: true })
      .setZone(LocalZone.instance, { keepLocalTime: true })
      .toJSDate()
  );

  export default {
    name: 'TravelForm',

    props: {
      date: DateTime,
    },

    created() {
      this.setNewShift(this.date);
    },

    destroyed() {
      this[SET_EDITABLE_RESERVE_SHIFT]({});
    },

    computed: {
      ...mapGetters('scheduling/pairings/reserve', ['isLoading']),
      ...mapState('scheduling/pairings/reserve', {
        travelForm: state => (state.editableReserveShift || {}),
      }),

      startTime: formProp('duty_on', { get: toFormValue, set: toInternalValue }),
      endTime: formProp('duty_off', { get: toFormValue, set: toInternalValue }),
      shortcut: formProp('shortcut'),

      titleDate() {
        return this.date.toLocaleString(DateTime.DATE_FULL);
      },
    },

    methods: {
      ...mapMutations('scheduling/pairings/reserve', [SET_EDITABLE_RESERVE_SHIFT]),

      setNewShift(date) {
        this[SET_EDITABLE_RESERVE_SHIFT]({
          shortcut: 'TRV',
          name: 'Travel',
          shift_type: TRAVEL_TYPE_ID,
          duty_on: date && DateTime.fromISO(date, { setZone: true }).startOf('day').toISO(),
          duty_off: date && DateTime.fromISO(date, { setZone: true }).endOf('day').toISO(),
        });
      },

      handleAddTravelClick() {
        this.$emit('add-shift', this.travelForm);
      },

      handleUpdateTravelClick() {
        const { shortcut, duty_on, duty_off } = this.travelForm;
        this.$emit('update-shift', { shortcut, duty_on, duty_off });
      },

      handleClearFormId() {
        const { id: _, ...form } = this.travelForm;
        this[SET_EDITABLE_RESERVE_SHIFT](form);
      },
    },

    watch: {
      date: 'setDateTimes',
    },
  };
</script>

<template>
  <div class="pair-binding-modal__travel-form fdt-travel-form">
    <h3>Travel Shift, {{ titleDate }}</h3>

    <div class="fdt-travel-form__row">
      <el-input class="fdt-travel-form__abbr" size="small" placeholder="Shortcut..." v-model="shortcut" />
      <el-date-picker v-model="startTime"
                      format="yyyy-MM-dd HH:mm"
                      size="small"
                      type="datetime"
                      placeholder="Duty On..." />
      <el-date-picker v-model="endTime"
                      format="yyyy-MM-dd HH:mm"
                      size="small"
                      type="datetime"
                      placeholder="Duty Off..." />
    </div>

    <div class="fdt-travel-form__buttons">
      <el-button-group v-if="travelForm.id !== undefined" class="fdt-travel-form__apply">
        <el-button size="small"
                   type="primary"
                   v-loading="isLoading"
                   @click="handleUpdateTravelClick">
          Update Travel Shift
        </el-button>
        <el-button type="primary"
                   size="small"
                   icon="el-icon-close"
                   title="Close"
                   @click="handleClearFormId"/>
      </el-button-group>

      <el-button class="fdt-travel-form__apply"
                 v-loading="isLoading"
                 type="primary"
                 size="small"
                 @click="handleAddTravelClick">
        Add {{ travelForm.id && 'New' }} Travel
      </el-button>
    </div>
  </div>
</template>

<style lang="scss">
  @import "../../../../../scss/bs-variables";

  .fdt-travel-form {
    background: $gray;
    padding: 10px 15px 15px;
    display: flex;
    flex-flow: column;

    &__row {
      display: flex;
      margin-bottom: 10px;

      & > * {
        margin-left: 5px;
        &:first-child { margin-left: 0; }
      }
    }

    &__buttons {
      display: flex;
      justify-content: flex-end;
    }
    &__abbr { flex: 0 0 20%; }
    &__apply {
      margin-top: 5px;
      & + & { margin-left: 15px; }
    }
  }
</style>
