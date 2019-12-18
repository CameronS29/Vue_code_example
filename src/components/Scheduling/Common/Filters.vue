<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { DateTime } from 'luxon';
  import { debounce } from 'lodash';

  import { SET_ACTUAL } from 'store/modules/fdt/calendar';
  import { DEFAULT_RANGE_VALUE } from 'store/modules/scheduling/gantt';
  import {
    PILOT_RANKS,
    CHANGE_RANK,
    CHANGE_ACTUAL,
    CHANGE_BASE_AIRPORTS,
    CHANGE_AIRCRAFT_TYPE,
    CHANGE_RANGE,
    CHANGE_NEW_HIRES,
    CHANGE_PILOT_NAME,
    SET_PAYROLL_MODE,
  } from 'store/modules/scheduling/consts';
  import { vuexProperty, downloadURI } from 'utils/helpers';
  import { queryParam } from 'utils/routers';

  import Icon from 'Common/Icon.vue';
  import ButtonEl from 'Common/Button.vue';
  import ViewPortal from 'Common/ViewPortal.vue';
  import FormattedMonthPicker from 'Common/FormattedMonthPicker.vue';
  import HistoryList from '../Calendar/RevisionHistory/HistoryList.vue';


  export default {
    name: 'ScheduleFilters',

    created() {
      this.getAllAvailableAirports();
    },

    props: {
      showRangePicker: {
        type: Boolean,
        default: false,
      },
      editableRevisions: {
        type: Boolean,
        default: true,
      },
      showRevisionSwitcher: {
        type: Boolean,
        default: true,
      },
      showActualSwitcher: {
        type: Boolean,
        default: true,
      },
    },
    components: {
      ButtonEl,
      ViewPortal,
      FormattedMonthPicker,
      HistoryList,
      Icon,
    },

    data() {
      return {
        rangeTempValue: DEFAULT_RANGE_VALUE,
        pilotNameModel: '',
      };
    },

    computed: {
      ...mapState('scheduling/calendar', ['year', 'month', 'isPilotView', 'isInPayrollMode']),
      ...mapState('scheduling/gantt', ['range']),
      ...mapGetters('scheduling/calendar', ['daysInMonth']),
      ...mapGetters('airports', ['pilotBases']),
      ...mapState('scheduling/calendar/filters', ['newHires']),
      ...mapGetters('scheduling/calendar/filters', [
        'rank',
        'baseAirportIds',
        'isActual',
        'showActual',
        'pilotName',
        'payrollCSVLink',
      ]),
      ...mapGetters('scheduling/revisions', ['hasRevisions', 'activeRevision']),

      filterIsActual: vuexProperty({ action: 'handleActualChange' })(
        'isActual',
        queryParam({ param: 'actual', defaultValue: true }),
      ),

      payrollMode: {
        get() {
          return this.isInPayrollMode;
        },
        set(value) {
          this[SET_PAYROLL_MODE](value);
        },
      },

      pilotRanks() {
        return PILOT_RANKS;
      },

      classes() {
        return {
          'schedule-filters': true,
          'schedule-filters_pilot-view': this.isPilotView,
        };
      },
    },

    methods: {
      ...mapActions('airports', ['getAllAvailableAirports']),
      ...mapActions('aircraft', ['getAircraftTypes']),

      ...mapActions('fdt/calendar', ['setActual']),
      ...mapMutations('fdt/calendar', [SET_ACTUAL]),
      ...mapMutations('scheduling/calendar', [SET_PAYROLL_MODE]),
      ...mapMutations('scheduling/calendar/filters', [
        CHANGE_RANK,
        CHANGE_BASE_AIRPORTS,
        CHANGE_AIRCRAFT_TYPE,
        CHANGE_ACTUAL,
        CHANGE_NEW_HIRES,
        CHANGE_PILOT_NAME,
      ]),
      ...mapMutations('scheduling/gantt', [
        CHANGE_RANGE,
      ]),

      handleRankChange(val) {
        this[CHANGE_RANK](val);
      },

      handleBaseAirportChange(val) {
        this[CHANGE_BASE_AIRPORTS](val);
      },

      handleActualChange(isActual) {
        this[CHANGE_ACTUAL](isActual);
        this[SET_ACTUAL](isActual);
        this.$emit('actual-changed');
      },

      handleNewHiresChange(value) {
        this[CHANGE_NEW_HIRES](value);
      },

      handleRangeInput(value) {
        this.rangeTempValue = value;
      },

      handleRangeChange() {
        this[CHANGE_RANGE](this.rangeTempValue);
      },

      handleSubmit() {
        this[CHANGE_PILOT_NAME](this.pilotNameModel);
        this.$emit('submit');
      },

      handleDateChange(date) {
        const { year, month } = DateTime.fromJSDate(date);
        this.$router.push({
          params: {
            year,
            month,
          },
        });
      },

      handleCSVClick() {
        downloadURI(this.payrollCSVLink);
      },
    },
  };
</script>

<template>
  <div :class="classes">
    <view-portal
      :min-width="`${ isPilotView ? 360 : 930 }px`"
      to="header">
      <div class="schedule-filters__header">
        <div class="schedule-filters__payroll" v-if="!isPilotView">
          <el-switch
            class="schedule-filters__payroll-switch"
            active-text="Payroll"
            inactive-text="Calendar"
            v-model="payrollMode"
          />
          <el-tooltip content="Download Payroll CSV" placement="bottom">
            <el-button
              @click="handleCSVClick"
              type="primary"
              class="schedule-filters__payroll-btn"
              size="mini">
              <icon glyph="file-excel-o" />
            </el-button>
          </el-tooltip>
        </div>

        <history-list
          :editable="editableRevisions"
          v-if="showRevisionSwitcher && hasRevisions && !isPilotView"
          class="revision-list" />

        <el-tooltip v-if="showActualSwitcher && showActual && !isPilotView"
                    content="Display Only Revision Duties / Combine with Actual Flights">
          <el-switch
            class="fdt-filter-form__switch"
            active-icon-class="fa fa-plane"
            inactive-icon-class="fa fa-calendar"
            v-model="filterIsActual"
          />
        </el-tooltip>

        <div
          v-if="showRangePicker"
          class="schedule-filters__range">
          <div class="schedule-filters__range-labels">
            <span class="schedule-filters__range-label">day</span>
            <span class="schedule-filters__range-label">week</span>
            <span class="schedule-filters__range-label">month</span>
          </div>
          <el-slider
            :value="rangeTempValue"
            @input="handleRangeInput"
            @change="handleRangeChange"
            :min="1"
            :max="daysInMonth" />
        </div>

        <formatted-month-picker
          class="schedule-filters__date"
          :year="year"
          :month="month"
          @change="handleDateChange"
        />
      </div>
    </view-portal>

    <el-input v-model="pilotNameModel" size="mini" class="pilot-name" placeholder="Name" clearable />

    <el-select
      :value="baseAirportIds"
      v-if="!isPilotView"
      class="base"
      @input="handleBaseAirportChange"
      filterable
      multiple
      size="mini"
      placeholder="Base">
      <el-option
        v-for="base in pilotBases"
        :key="base.id"
        :label="base.iata"
        :value="base.iata"
      />
    </el-select>

    <el-select
      :value="rank"
      v-if="!isPilotView"
      class="rank"
      clearable
      size="mini"
      @input="handleRankChange"
      placeholder="Rank">
      <el-option
        v-for="(pilotRank, id) in pilotRanks"
        :key="id"
        :label="pilotRank"
        :value="id" />
    </el-select>

    <el-checkbox :value="newHires"
                 v-if="!isPilotView"
                 @change="handleNewHiresChange"
                 class="new-hires"
                 size="mini"
                 label="New Hires"
                 border />
    <el-button v-if="!isPilotView" type="primary" size="mini" class="submit-btn" @click="handleSubmit">
      Filter
    </el-button>
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .schedule-filters {
    display: flex;
    align-items: center;
    height: 40px;
    @media screen and (max-width: 930px) {
      flex-flow: row wrap;
      height: auto;
      margin-bottom: 10px;
    }
    &_pilot-view {
      @media screen and (max-width: 930px) {
        margin-bottom: 0;
      }
    }
    .el-select {
      margin-right: 10px;
      @media screen and (max-width: $screen-xs-max) {
        margin-bottom: 10px;
        width: 100%;
        flex: 0 0 100%;
      }
      &.rank {
        width: 120px;
        @media screen and (max-width: $screen-xs-max) {
          flex: 0 0 100%;
        }
      }
      &.base {
        @media screen and (max-width: $screen-xs-max) {
          flex: 0 0 100%;
        }
      }
      &.aircraft-type {
        flex: 0 0 130px;
        @media screen and (max-width: $screen-xs-max) {
          flex: 0 0 100%;
        }
      }
    }
    .submit-btn {
      flex: 0 0;
      height: 26px;
      padding: 0 10px;
      @media screen and (max-width: $screen-xs-max) {
        margin-bottom: 10px;
        width: 100%;
        flex: 0 0 100%;
      }
    }

    .new-hires {
      margin-top: 4px;
      margin-right: 10px;
      background: white;
    }

    .pilot-name {
      margin-right: 10px;
      width: 150px;
    }

    &__header {
      display: flex;
      align-items: center;
      @media screen and (max-width: 930px) {
        flex: 1 1 100%;
        margin-bottom: 10px;
        display: flex;
        flex-flow: row wrap;
      }
      .revision-list {
        @media screen and (max-width: 930px) {
          margin-top: 5px;
          margin-bottom: 5px;
        }
      }
    }

    &__range {
      width: 180px;
      margin-left: 30px;
      &-labels {
        color: #8B8E8F;
        font-size: 13px;
        display: flex;
        justify-content: space-between;
      }
      &-label {
        &:nth-child(1) {
          flex: 1 1 50px;
        }
        &:nth-child(2) {
          flex: 1 1 150px;
        }
        &:nth-child(3) {
          flex: 0 0 auto;
        }
      }
      .el-slider__runway {
        margin: 10px 0;
      }
    }

    &__date {
      margin-left: 15px;
    }

    &__payroll {
      margin-right: 15px;
      padding-right: 15px;
      border-right: 1px solid #ccc;
    }

    &__payroll-switch {

    }

    &__payroll-btn {
      padding: 7px;
      margin-left: 5px;
    }
  }
</style>
