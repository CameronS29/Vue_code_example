<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { DateTime } from 'luxon';
  import { debounce } from 'lodash';

  import {
    COLOR_CODING_OPTIONS,
    CONFLICT_COLOR_CODING,
    HOBBS_COLOR_CODING,
    STATUS_COLOR_CODING,
    OPERATION_COLOR_CODING,
  } from 'store/modules/routeplanningGantt';
  import {
    SCHEDULED_OPERATION,
    CHARTER_OPERATION,
    REPOSITION_OPERATION,
    MAINTENANCE_OPERATION,
    TRAINING_OPERATION,
  } from 'store/modules/flights';

  import FormattedMonthPicker from 'Common/FormattedMonthPicker.vue';
  import FormattedDayPicker from 'Common/FormattedDayPicker.vue';
  import FormattedWeekPicker from 'Common/FormattedWeekPicker.vue';
  import HorizontalScrollable from 'Common/HorizontalScrollable.vue';

  export default {
    components: {
      FormattedMonthPicker,
      FormattedDayPicker,
      FormattedWeekPicker,
      HorizontalScrollable,
    },
    computed: {
      ...mapState('routeplanningGantt', [
        'eCheckListMode',
        'filters',
        'ganttTableRange',
        'colorCoding',
      ]),
      ...mapGetters('routeplanningGantt', [
        'isNowInTimeFrame',
      ]),
      ...mapGetters('aircraft', [
        'aircrafts',
      ]),
      live: {
        get() {
          return this.filters.live;
        },
        set(live) {
          this.updateFilters({ live });
        },
      },
      searchQuery: {
        get() {
          return this.filters.searchQuery;
        },
        set: debounce(function (searchQuery) {
          this.updateFilters({ searchQuery });
        }, 1000),
      },
      routeplanningDateModel: {
        get() {
          return DateTime.fromISO(this.filters.dateStart, { zone: 'UTC' })
            .setZone('local', { keepCalendarTime: true })
            .plus({ days: 1 })
            .toJSDate();
        },
        set(date) {
          const parsedDate = DateTime.fromJSDate(date)
            .setZone('UTC', { keepCalendarTime: true });

          this.updateFilters({
            dateStart: parsedDate.startOf('week')
              .minus({ days: 1 })
              .toISO(),
            dateEnd: parsedDate.endOf('week')
              .minus({ days: 1 })
              .toISO(),
          });
        },
      },
      eChecklistDateModel: {
        get() {
          return DateTime.fromISO(this.filters.dateStart, { zone: 'UTC' })
            .setZone('local', { keepCalendarTime: true })
            .toJSDate();
        },
        set(date) {
          const parsedDate = DateTime.fromJSDate(date)
            .setZone('UTC', { keepCalendarTime: true });

          this.updateFilters({
            dateStart: parsedDate.startOf('day')
              .toISO(),
            dateEnd: parsedDate.endOf('day')
              .toISO(),
          });
        },
      },
      colorCodingModel: {
        get() {
          return this.colorCoding;
        },
        set(value) {
          this.setColorCoding(value);
        },
      },
      aircraftFilterModel: {
        get() {
          return this.filters.aircrafts;
        },
        set(aircrafts) {
          this.updateFilters({ aircrafts });
        },
      },
    },
    methods: {
      ...mapActions('routeplanningGantt', [
        'updateFilters',
        'publish',
      ]),
      ...mapMutations('routeplanningGantt', [
        'setGanttTableRange',
        'setColorCoding',
        'setSelectMode',
      ]),
      async handlePublish() {
        await this.publish();
      },
      goToNow() {
        this.$emit('go-to-now-click');
      },
      goToSelectMode() {
        this.setSelectMode(true);
      },
    },
    data() {
      return {
        COLOR_CODING_OPTIONS,
        CONFLICT_COLOR_CODING,
        HOBBS_COLOR_CODING,
        STATUS_COLOR_CODING,
        OPERATION_COLOR_CODING,

        SCHEDULED_OPERATION,
        CHARTER_OPERATION,
        REPOSITION_OPERATION,
        MAINTENANCE_OPERATION,
        TRAINING_OPERATION,
      };
    },
  };
</script>

<template>
  <div class="aircraft-gantt-filters__wrapper">
    <horizontal-scrollable hide-scrollbar fade-color="#F3F3F4">
      <section class="aircraft-gantt-filters">
        <div class="aircraft-gantt-filters__go-to-now">
          <el-button v-if="isNowInTimeFrame"
                     size="small" @click="goToNow" icon="fa fa-fw fa-dot-circle-o">
            Go to NOW
          </el-button>
        </div>

        <div v-if="!eCheckListMode"
             class="aircraft-gantt-filters__publishing">
          <el-button @click="handlePublish" type="primary" size="mini" icon="el-icon-success"
                     class="aircraft-gantt-filters__publish-btn" v-if="!filters.live">
            Publish
          </el-button>
          <el-switch
            v-model="live"
            active-text="Live"
            inactive-text="Draft" />
        </div>

        <div class="aircraft-gantt__color-coding-switcher">
          <el-select size="small" v-model="colorCodingModel" placeholder="ColorCodig">
            <el-option
              v-for="item in COLOR_CODING_OPTIONS"
              :key="item"
              :label="item"
              :value="item" />
          </el-select>
        </div>

        <div class="aircraft-gantt__legend aircraft-gantt__legend_conflict"
             v-if="colorCodingModel === CONFLICT_COLOR_CODING">
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_conflict">Physical conflict</div>
          <div class="aircraft-gantt__legend-item">Normal flight</div>
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_actual">Actual flight</div>
        </div>
        <div class="aircraft-gantt__legend aircraft-gantt__legend_hobbs"
             v-if="colorCodingModel === HOBBS_COLOR_CODING">
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_h-50">50h <= H</div>
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_h-15">15h <= H</div>
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_h-8">8h <= H</div>
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_h-0">0h <= H</div>
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_h-negative">H < 0h</div>
        </div>
        <div class="aircraft-gantt__legend aircraft-gantt__legend_hobbs"
             v-if="colorCodingModel === STATUS_COLOR_CODING">
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_comp-on-time">completed/on-time</div>
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_future-on-time">future/on-time</div>
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_comp-delayed">completed/delayed</div>
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_future-delayed">future/delayed</div>
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_cancelled">cancelled</div>
        </div>
        <div class="aircraft-gantt__legend aircraft-gantt__legend_hobbs"
             v-if="colorCodingModel === OPERATION_COLOR_CODING">
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_scheduled">{{ SCHEDULED_OPERATION }}</div>
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_charter">{{ CHARTER_OPERATION }}</div>
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_reposition">{{ REPOSITION_OPERATION }}
          </div>
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_maintenance">{{ MAINTENANCE_OPERATION }}
          </div>
          <div class="aircraft-gantt__legend-item aircraft-gantt__legend-item_training">{{ TRAINING_OPERATION }}</div>
        </div>

        <div class="aircraft-gantt-filters__range">
          <div class="aircraft-gantt-filters__range-labels">
            <span class="aircraft-gantt-filters__range-label">3 hours</span>
            <span class="aircraft-gantt-filters__range-label">day</span>
          </div>
          <el-slider
            :value="ganttTableRange"
            @input="setGanttTableRange"
            :step="0.08"
            :min="0.125"
            :show-tooltip="false"
            :max="1"
          />
        </div>

        <formatted-day-picker
          class="aircraft-gantt__date"
          v-if="eCheckListMode"
          v-model="eChecklistDateModel"
        />
        <formatted-week-picker
          class="aircraft-gantt__date"
          v-else
          v-model="routeplanningDateModel"
        />

        <el-select
          v-model="aircraftFilterModel"
          multiple
          collapse-tags
          size="small"
          class="aircraft-gantt-filters__aircrafts"
          placeholder="Aircraft filter">
          <el-option
            v-for="aircraft in aircrafts"
            :key="aircraft.id"
            :label="aircraft.registration"
            :value="aircraft.id">
            {{ aircraft.registration }}
          </el-option>
        </el-select>
        <div class="aircraft-gantt-filters__search">
          <el-input v-model="searchQuery" size="small" clearable placeholder="Pilot, flight...">
            <i slot="prefix" class="el-input__icon el-icon-search" />
          </el-input>
        </div>

        <router-link
          v-if="!eCheckListMode"
          :to="{ name: 'lines_management' }">
          <el-button size="small" type="primary" icon="fa fa-fw fa-cog"> Manage Lines</el-button>
        </router-link>
        <el-button @click="goToSelectMode"
                   size="small" type="warning" icon="fa fa-fw fa-check-circle"> Select Mode
        </el-button>
      </section>
    </horizontal-scrollable>
  </div>
</template>

<style lang="scss">
  @import '../../../scss/bs-variables';

  .aircraft-gantt-filters {
    display: inline-flex;
    align-items: center;
    overflow-y: hidden;
    > * {
      margin: 0 10px;
    }
    &__wrapper {
      max-width: 100%;
      overflow-y: hidden;
    }
    &__publishing {
      border-right: 1px solid #cccccc87;
      padding-right: 20px;
      display: flex;
      align-items: center;
    }
    &__publish-btn {
      margin-right: 10px;
    }
    &__range {
      width: 130px;
      flex: 0 0 130px;
      margin-left: 15px;
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
          flex: 0 0 auto;
        }
      }
      .el-slider__runway {
        margin: 10px 0;
      }
    }

    &__aircrafts {
      width: 154px;
      flex: 0 0 154px;
    }

    &__search {
      width: 160px;
      flex: 0 0 160px;
    }

    &__go-to-now {
      border-right: 1px solid #cccccc87;
      padding-right: 20px;
    }

  }

  .aircraft-gantt {
    &__color-coding-switcher {
      width: 100px;
      flex: 0 0 100px;
    }
    &__legend {
      display: grid;
      column-gap: 5px;
      grid-template-columns: 1fr;
      border-right: 1px solid #cccccc87;
      padding-right: 20px;

      &_conflict {
        grid-template-columns: 1fr;
      }
      &_hobbs {
        grid-template-columns: 1fr 1fr;
      }
    }
    &__legend-item {
      display: flex;
      align-items: center;
      margin-right: 5px;
      font-size: 12px;
      line-height: 14px;
      white-space: nowrap;

      &:before {
        display: inline-block;
        content: '';
        height: 10px;
        width: 10px;
        margin-right: 5px;
        border: 1px solid #dcdfe6;
        background-color: $black;
      }
      &_conflict {
        &:before {
          background-color: $red;
        }
      }
      &_actual {
        &:before {
          background-color: transparentize($black, .4);
        }
      }

      &_h-15 {
        &:before {
          background-color: $brand-success;
        }
      }
      &_h-8 {
        &:before {
          background-color: $brand-warning;
        }
      }
      &_h-0 {
        &:before {
          background-color: darken($brand-warning, 20%);
        }
      }
      &_h-negative {
        &:before {
          background-color: $red;
        }
      }

      &_comp-on-time {
        &:before {
          background-color: transparentize($black, .4);
        }
      }
      &_future-on-time {
        &:before {
        }
      }
      &_comp-delayed {
        &:before {
          background-color: darken($brand-warning, 20%);
        }
      }
      &_future-delayed {
        &:before {
          background-color: $brand-warning;
        }
      }
      &_cancelled {
        &:before {
          background-color: $red;
        }
      }

      &_charter {
        &:before {
          background: lighten($brand-warning, 5%);
        }
      }

      &_reposition {
        &:before {
          background: lighten($brand-info, 5%);
        }
      }

      &_maintenance {
        &:before {
          background: $red
        }
      }

      &_training {
        &:before {
          background: lighten($brand-success, 5%);
        }
      }
    }
  }
</style>
