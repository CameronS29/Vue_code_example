<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import differenceInSeconds from 'date-fns/differenceInSeconds';
  import { DateTime } from 'luxon';

  import {
    getDestination, getOrigin, getDeparture, getArrival,
    getPIC, getSIC,
  } from 'store/modules/routeplanningGantt/utils';
  import {
    CONFLICT_COLOR_CODING,
    HOBBS_COLOR_CODING,
    STATUS_COLOR_CODING,
    OPERATION_COLOR_CODING,
  } from 'store/modules/routeplanningGantt';
  import {
    SET_FLIGHT,
    OPERATION_MAP,
    SCHEDULED_OPERATION,
    CHARTER_OPERATION,
    REPOSITION_OPERATION,
    MAINTENANCE_OPERATION,
    TRAINING_OPERATION,
  } from 'store/modules/flights';
  import { statuses } from 'store/modules/flights/consts';

  const SECONDS_IN_DAY = 60 * 60 * 24;

  export default {
    props: {
      flight: {
        type: Object,
        required: true,
      },
      dateTime: {
        type: Boolean,
        default: false,
      },
      date: {
        type: Boolean,
        default: true,
      },
      showPlus: {
        type: Boolean,
        default: false,
      },
      showDelete: {
        type: Boolean,
        default: false,
      },
      showCheck: {
        type: Boolean,
        default: false,
      },
      showHobbs: {
        type: Boolean,
        default: false,
      },
      timelinePosition: {
        type: Boolean,
        default: false,
      },
      isLast: {
        type: Boolean,
        default: false,
      },
      markAssigned: {
        type: Boolean,
        default: false,
      },
      nextMx: {
        type: Number,
        default: 0,
      },
      colorCoded: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      ...mapState('routeplanningGantt', [
        'filters',
        'colorCoding',
      ]),
      ...mapGetters('routeplanningGantt', [
        'daysInFilterDateRange',
        'ganttDateRangeISO',
      ]),
      ...mapGetters('aircraft', [
        'aircraftById',
      ]),

      origin() {
        return getOrigin(this.flight);
      },
      destination() {
        return getDestination(this.flight);
      },

      departureDateTime() {
        return getDeparture(this.flight);
      },

      arrivalDateTime() {
        return getArrival(this.flight);
      },

      parsedDeparture() {
        return DateTime.fromISO(this.departureDateTime, { zone: 'UTC' });
      },

      parsedArrival() {
        return DateTime.fromISO(this.arrivalDateTime, { zone: 'UTC' });
      },

      formattedDepartureDate() {
        return this.parsedDeparture.toFormat('M/d');
      },

      formattedDepartureTime() {
        return this.parsedDeparture.toLocaleString(DateTime.TIME_24_SIMPLE);
      },

      formattedArrivalTime() {
        return this.parsedArrival.toLocaleString(DateTime.TIME_24_SIMPLE);
      },
      sectionStartDiff() {
        return differenceInSeconds(this.departureDateTime, this.ganttDateRangeISO[0]) / SECONDS_IN_DAY;
      },
      endStartDiff() {
        return differenceInSeconds(this.arrivalDateTime, this.departureDateTime) / SECONDS_IN_DAY;
      },
      style() {
        if (!this.timelinePosition) return undefined;

        return {
          position: 'absolute',
          left: `${this.daysToPercents(this.sectionStartDiff)}%`,
          width: `${this.daysToPercents(this.endStartDiff)}%`,
        };
      },
      hobbsStyle() {
        if (!this.timelinePosition) return undefined;

        return {
          position: 'absolute',
          left: `${this.daysToPercents(this.sectionStartDiff) + this.daysToPercents(this.endStartDiff)}%`,
        };
      },
      isAlreadyAssigned() {
        return this.markAssigned && this.flight.assigned;
      },
      classes() {
        return {
          'flight-block': true,
          'flight-block_assigned': this.isAlreadyAssigned,
        };
      },
      hobbsLeft() {
        return (this.nextMx - this.projectedHobbs).toFixed(1);
      },
      bodyClass() {
        let colorCodingClasses = {};

        if (this.colorCoded) {
          switch (this.colorCoding) {
            case CONFLICT_COLOR_CODING:
              colorCodingClasses = {
                'flight-block__body_actual': this.flight.actual_aircraft,
                'flight-block__body_conflict': this.flight.isConflicting,
              };
              break;
            case HOBBS_COLOR_CODING:
              colorCodingClasses = {
                'flight-block__body_h-15': (this.hobbsLeft < 50) && (this.hobbsLeft >= 15),
                'flight-block__body_h-8': (this.hobbsLeft < 15) && (this.hobbsLeft >= 8),
                'flight-block__body_h-0': (this.hobbsLeft < 8) && (this.hobbsLeft >= 0),
                'flight-block__body_h-negative': this.hobbsLeft < 0,
              };
              break;
            case STATUS_COLOR_CODING:
              const isActual = this.flight.actual_aircraft;

              colorCodingClasses = {
                'flight-block__body_comp-on-time': isActual && !this.flight.is_delayed,
                'flight-block__body_future-on-time': !isActual && !this.flight.is_delayed,
                'flight-block__body_comp-delayed': isActual && this.flight.is_delayed,
                'flight-block__body_future-delayed': !isActual && this.flight.is_delayed,
                'flight-block__body_cancelled': this.flight.status === statuses.CANCELED,
              };
              break;
            case OPERATION_COLOR_CODING:
              const operations = this.flight.type_of_operations;

              colorCodingClasses = {
                'flight-block__body_charter': operations === OPERATION_MAP[CHARTER_OPERATION],
                'flight-block__body_reposition': operations === OPERATION_MAP[REPOSITION_OPERATION],
                'flight-block__body_maintenance': operations === OPERATION_MAP[MAINTENANCE_OPERATION],
                'flight-block__body_training': operations === OPERATION_MAP[TRAINING_OPERATION],
              };
          }
        }

        return {
          'flight-block__body': true,
          ...colorCodingClasses,
        };
      },
      assignedAircraftRegistration() {
        const aircraft = this.flight.actual_aircraft
          || (this.filters.live ? this.flight.assigned_aircraft : this.flight.draft_aircraft);
        if (!aircraft) return undefined;

        return this.aircraftById(aircraft).registration;
      },
      additionIcon() {
        return this.isAlreadyAssigned ? 'fa-refresh' : ' fa-plus';
      },
      projectedHobbs() {
        const finalHobbs = parseFloat(this.flight.final_hobbs);
        const initialHobbs = parseFloat(this.flight.initial_hobbs);
        if (finalHobbs) {
          return finalHobbs;
        } else if (this.filters.live) {
          return this.flight.projected_hobbs;
        } else {
          return this.flight.projected_hobbs_draft;
        }
      },
      isCancelled() {
        return this.flight.status === statuses.CANCELED;
      },
      showHobbsTooltip() {
        return this.showHobbs && (!this.isCancelled);
      },
      isCheckedModel: {
        get() {
          return this.isSelected;
        },
        set(flag) {
          const { flight } = this;

          this.$emit('check-change', {
            flight,
            flag,
          });
        },
      },
    },
    methods: {
      ...mapActions('flights', ['fetchFlight', 'fetchFlightStatuses']),
      ...mapMutations('flights', [SET_FLIGHT]),
      daysToPercents(days) {
        return (100 * days) / this.daysInFilterDateRange;
      },
      handleClick() {
        this[SET_FLIGHT](this.flight);
        this.fetchFlight(this.flight.id);
      },
      handlePlusClick() {
        this.$emit('plus-click', this.flight);
      },
      handleDeleteClick() {
        this.$emit('delete-click', this.flight);
      },
      handleBatchDeleteClick() {
        this.$emit('batch-delete-click', this.flight);
      },
    },
  };
</script>

<template>
  <div>
    <div :style="style" @click.stop="handleClick" :class="classes">
      <div class="flight-block__arrows">
        <el-tooltip :disabled="!isAlreadyAssigned" class="item" effect="dark"
                    :content="`This flight is already assigned to ${assignedAircraftRegistration}`"
                    placement="top">
          <div :class="bodyClass">
            <span v-if="showCheck" @click.stop class="flight-block__check">
              <el-checkbox v-model="isCheckedModel" />
            </span>
            <span v-if="showPlus && !flight.actual_aircraft && !isCancelled"
                  @click.stop="handlePlusClick"
                  class="flight-block__plus fa fa-fw" :class="additionIcon" />
            <span class="flight-block__plus flight-block__aircraft" @click.stop="handlePlusClick"
                  v-if="isAlreadyAssigned">{{ assignedAircraftRegistration }}</span>

            <span class="flight-block__main-info">
              <strong>{{ flight.flight_number }}</strong>
              <span class="flight-block__hobbs-left" v-if="showHobbsTooltip">{{ hobbsLeft }}</span>
              {{ origin.iata || flight.origin }}–{{ destination.iata || flight.destination }}
            </span>

            <span v-if="showDelete && !flight.actual_aircraft && !isCancelled"
                  @click.stop="handleDeleteClick"
                  class="flight-block__delete fa fa-times" />
            <span v-if="showDelete && !flight.actual_aircraft && !isLast && !isCancelled"
                  @click.stop="handleBatchDeleteClick"
                  class="flight-block__batch-delete">
              Batch remove <span class="fa fa-arrow-right" />
            </span>
          </div>
        </el-tooltip>
      </div>
      <div v-if="dateTime" class="flight-block__date-time">
        <span v-if="date" class="flight-block__date">{{ formattedDepartureDate }}</span>
        <span class="flight-block__time">{{ formattedDepartureTime }}–{{ formattedArrivalTime }}</span>
      </div>
    </div>
    <div v-if="isLast" :style="hobbsStyle" class="flight-block__hobbs">
      {{ projectedHobbs }} hobbs ({{ hobbsLeft }} left)
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .flight-block__hobbs {
    position: absolute;
    right: 10px;
    white-space: nowrap;
  }

  .flight-block {
    font-size: 11px;
    cursor: pointer;
    transition: opacity .2s;
    &_assigned {
      opacity: .4;
      &:hover {
        opacity: 1;
      }
      .flight-block {
        &__body {
          width: auto;
        }
      }
    }
    &__arrows {
      display: flex;
      flex-flow: row wrap;
      position: relative;

      &:hover {
        .flight-block__plus {
          display: block;
        }
        .flight-block__delete {
          display: block;
        }
        .flight-block__batch-delete {
          display: inline-flex;
        }
      }
    }

    &__body {
      background-color: $black;
      color: #fff;
      border-radius: 2px;
      width: 88px;
      overflow: hidden;
      text-transform: uppercase;
      text-align: center;
      white-space: nowrap;
      text-overflow: ellipsis;
      flex: 1 1 calc(100% - 9px);
      display: flex;
      align-items: center;
      line-height: 16px;

      &_actual {
        background-color: transparentize($black, .4);
      }
      &_conflict {
        background-color: $red;
      }

      &_h-15 {
        background-color: $brand-success;
      }
      &_h-8 {
        background-color: $brand-warning;
      }
      &_h-0 {
        background-color: darken($brand-warning, 20%);
      }
      &_h-negative {
        background-color: $red;
      }

      &_comp-on-time {
        background-color: transparentize($black, .4);
      }
      &_future-on-time {

      }
      &_comp-delayed {
        background-color: darken($brand-warning, 20%);
      }
      &_future-delayed {
        background-color: $brand-warning;
      }
      &_cancelled {
        background-color: $red;
      }

      &_charter {
        background: lighten($brand-warning, 5%);
        color: $black;
      }
      &_reposition {
        background: lighten($brand-info, 5%);
        color: $black;
      }
      &_maintenance {
        background: $red;
      }
      &_training {
        background: lighten($brand-success, 5%);
      }
    }
    &__hobbs {
      margin-left: 5px;
    }
    &__hobbs-left {
      font-size: 10px;
    }

    &__plus {
      background-color: $brand-success;
      color: #fff;
      height: 16px;
      line-height: 16px;
      border-radius: 2px 0 0 2px;
      padding: 0 2px;
      text-align: center;
      display: none;
      position: absolute;
      left: -13px;
    }
    &__check {
      background-color: $navy;
      position: absolute;
      left: -15px;
      height: 16px;
      width: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 2px 0 0 2px;
      .el-checkbox {
        margin: 0;
      }
    }
    &__delete {
      background-color: $red;
      color: #fff;
      height: 16px;
      line-height: 16px;
      width: 14px;
      text-align: center;
      display: none;
      position: absolute;
      right: -13px;
      z-index: 10;
      transition: .2s;
      &:hover {
        background: lighten($red, 10%);
      }
    }
    &__batch-delete {
      background-color: $red;
      color: #fff;
      height: 16px;
      line-height: 16px;
      text-align: center;
      display: none;
      position: absolute;
      z-index: 10;
      width: 110px;
      right: -123px;
      border-left: 1px solid #fff;
      transition: .2s;
      align-items: center;
      justify-content: space-between;
      padding: 0 3px;
      &:hover {
        background: lighten($red, 10%);
      }
    }

    &__main-info {
      flex: 1 1;
      overflow-x: hidden;
      padding: 0 2px;
    }
    &__date-time {
      color: #6a6a6a;
      white-space: nowrap;
    }
    &__date {
      font-weight: bold;
    }
  }
</style>
