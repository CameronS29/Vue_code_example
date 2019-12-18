<script>
  import { mapGetters, mapActions } from 'vuex';
  import { FNS_US_DATE_FORMAT } from 'store/modules/scheduling/consts';

  import format from 'date-fns/format';
  import parse from 'date-fns/parse';

  import ButtonEl from 'Common/Button.vue';
  import dateRangeCheckMixin from './dateRangeCheckMixin';

  const baseDate = new Date(0);
  const getDateString = jsDate => (jsDate && format(jsDate, FNS_US_DATE_FORMAT));
  const getISOString = dateStr => (dateStr && parse(dateStr, FNS_US_DATE_FORMAT, baseDate).toISOString());

  export default {
    name: 'TableHeading',

    mixins: [dateRangeCheckMixin],

    props: {
      startDate: {
        type: String,
        default: null,
      },

      endDate: {
        type: String,
        default: null,
      },

      base: String,
      station: String,

      editable: {
        type: Boolean,
        default: false,
      },

      daysOfWeek: {
        type: Array,
        default: () => ([false, false, false, false, false, false, false]),
      },

      disabledIntervals: {
        type: Array,
        default: () => ([]),
      },
    },

    data() {
      return {
        weekDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      };
    },

    components: { ButtonEl },

    computed: {
      ...mapGetters('airports', ['airports', 'pilotBases']),

      selectedWeekDays: {
        get() {
          return this.daysOfWeek.map((day, index) => day && this.weekDays[index]);
        },
        set(selectedDays) {
          const daysMap = this.weekDays.map(day => selectedDays.indexOf(day) > -1);
          return this.patchEditablePairingTemplate({ days_of_week: daysMap });
        },
      },

      editableBase: {
        get() { return this.base; },
        set(value) { this.$emit('update:base', value); },
      },

      editableStation: {
        get() { return this.station; },
        set(value) { this.$emit('update:station', value); },
      },

      editableStartDate: {
        get() { return getISOString(this.startDate); },
        set(value) { this.$emit('update:start-date', getDateString(value)); },
      },

      editableEndDate: {
        get() { return getISOString(this.endDate); },
        set(value) { this.$emit('update:end-date', getDateString(value)); },
      },

      startDateBoolean: {
        get() { return !!this.editableStartDate; },
        set(value) { this.$emit('update:start-date', getDateString(value ? new Date() : null)); },
      },

      endDateBoolean: {
        get() { return !!this.editableEndDate; },
        set(value) { this.$emit('update:end-date', getDateString(value ? new Date() : null)); },
      },

      formattedDateString() {
        const { startDate, endDate } = this;
        if (startDate && endDate) {
          return `${startDate} - ${endDate}`;
        }

        if (!startDate && !endDate) {
          return 'All the time';
        } else if (!endDate) {
          return `Since ${startDate}`;
        } else if (!startDate) {
          return `Until ${endDate}`;
        }
        return '';
      },

      formattedWeekDays() {
        const weekDayList = this.daysOfWeek
          .map((day, index) => day && this.weekDays[index])
          .filter(day => day);

        return weekDayList.length === 7 ? 'Entire week' : weekDayList.join(', ');
      },

      startPickerOptions() {
        const { startDate, endDate } = this;
        const intervals = this.disabledIntervals;
        const disabledDate = this.pickerStartDateDisabled(
          parse(startDate, FNS_US_DATE_FORMAT, baseDate),
          parse(endDate, FNS_US_DATE_FORMAT, baseDate),
          intervals,
        );
        return { disabledDate };
      },

      endPickerOptions() {
        const { startDate, endDate } = this;
        const intervals = this.disabledIntervals;
        const disabledDate = this.pickerEndDateDisabled(
          parse(startDate, FNS_US_DATE_FORMAT, baseDate),
          parse(endDate, FNS_US_DATE_FORMAT, baseDate),
          intervals,
        );
        return { disabledDate };
      },
    },

    methods: mapActions('scheduling/pairingTemplates', ['patchEditablePairingTemplate']),
  };
</script>

<template>
  <div class="flight-table__heading flight-table__heading_editable" v-if="editable">
    <div class="flight-table__airports">
      <div class="flight-table__base">
        <strong>Base</strong>
        <el-select v-model="editableBase"
                   class="flight-table__base-select"
                   placeholder="Pick..."
                   filterable
                   clearable>
          <el-option :key="base.id" :value="base.iata" v-for="base in pilotBases">
            {{ base.iata }}
          </el-option>
        </el-select>
      </div>

      <div class="flight-table__base">
        <strong>Station</strong>
        <el-select v-model="editableStation"
                   class="flight-table__base-select"
                   placeholder="Pick..."
                   filterable
                   clearable>
          <el-option :key="base.id" :value="base.iata" v-for="base in airports">
            {{ base.iata }}
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="flight-table__heading-label">
      <el-switch
        v-model="startDateBoolean"
        active-text="From (UTC):"
        inactive-text="From ∞"
      />
      <el-date-picker
        class="date-picker"
        placeholder="Start Date"
        v-model="editableStartDate"
        :picker-options="startPickerOptions"
      />
    </div>

    <div class="flight-table__heading-label">
      <el-switch
        v-model="endDateBoolean"
        active-text="Until (UTC):"
        inactive-text="Until ∞"
      />
      <el-date-picker
        class="date-picker"
        placeholder="End Date"
        v-model="editableEndDate"
        :picker-options="endPickerOptions"
      />
    </div>

    <div class="flight-table__weekdays">
      <h4>Weekdays</h4>
      <el-checkbox-group v-model="selectedWeekDays" size="small">
        <el-checkbox-button
          v-for="(day, index) in weekDays"
          :label="day"
          :key="index">
          {{ day }}
        </el-checkbox-button>
      </el-checkbox-group>
    </div>
  </div>
  <div class="flight-table__heading" v-else>
    <span class="flight-table__heading-title">
      <el-tag v-if="base">
        <strong>{{ base }}</strong>
        <span v-if="station">({{ station }})</span>
      </el-tag>
      <strong>{{ formattedDateString }}:</strong>
      ({{ formattedWeekDays }})
    </span>
    <div class="flight-table__heading-controls">
      <button-el title="Edit" icon="pencil" size="xs" @click="$emit('edit')" />
      <button-el type="danger" title="Delete" icon="trash" size="xs" @click="$emit('delete')" />
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .flight-table {
    &__heading {
      padding: 10px 15px;
      display: flex;
      align-items: center;
      flex-flow: row wrap;

      &_editable {
        padding: 10px 15px;
        flex-flow: row wrap;
      }
    }

    &__weekdays {
      margin: 5px 0;
    }

    &__airports {
      margin-right: 10px;
    }

    &__base {
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      & + & {
        margin: 0;
      }
    }

    &__base-select {
      margin-left: 5px;
      width: 110px;
    }

    &__heading-label {
      background: #eef6f6;
      border-radius: 3px;
      padding: 5px;
      flex: 1 1;
      display: flex;
      align-items: center;
      justify-content: space-around;
      flex-flow: row wrap;

      &:not(:last-of-type) {
        margin-right: 10px;
      }

      .el-switch {
        margin: 5px 0;
      }
      .el-input {
        margin: 5px 0 5px 5px;
        max-width: 140px;
        @media screen and (max-width: $screen-xs-max) {
          width: 100%;
          margin-left: 0;
        }
      }
    }

    &__heading-controls {
      margin-left: auto;
    }
  }
</style>
