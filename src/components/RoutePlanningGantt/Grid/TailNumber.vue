<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { min, max, round, find, compact } from 'lodash';
  import differenceInMinutes from 'date-fns/differenceInMinutes';

  import { BEFORE_FLIGHT, AFTER_FLIGHT } from 'store/modules/routeplanningGantt';
  import { TAIL_STATUSES } from 'store/modules/dispatch/e-checklist';

  export default {
    props: {
      aircraft: {
        type: Object,
        required: true,
      },
      flights: {
        type: Array,
        default: () => [],
      },
    },
    computed: {
      ...mapState('routeplanningGantt', [
        'flightAssignment',
        'filters',
        'eCheckListMode',
      ]),
      actualFlights() {
        return this.flights.filter(flight => flight.actual_aircraft);
      },
      scheduledFlights() {
        return this.flights.filter(flight => !flight.actual_aircraft);
      },
      conflictCount() {
        return this.aircraft.conflictingFlightIds.length;
      },
      projectedHobbs() {
        if (this.filters.live) {
          return this.aircraft.projected_hobbs;
        } else {
          return this.aircraft.projected_hobbs_draft;
        }
      },
      isCurrentAircraftSelected() {
        return this.flightAssignment.aircraft === this.aircraft.id;
      },
      classes() {
        return {
          'gantt-tail-number': true,
        };
      },
      actualShare() {
        return this.share(parseFloat(this.aircraft.hobbs));
      },
      projectedShare() {
        return this.share(parseFloat(this.projectedHobbs));
      },
      actualBarStyle() {
        return {
          width: `${this.actualShare}%`,
        };
      },
      projectedBarStyle() {
        return {
          width: `${this.projectedShare}%`,
        };
      },
      actualBarClass() {
        return {
          'gantt-tail-number__mxc-bar': true,
          'gantt-tail-number__mxc-bar_yellow': this.actualShare > 60,
          'gantt-tail-number__mxc-bar_red': this.actualShare > 80,
        };
      },
      projectedBarClass() {
        return {
          'gantt-tail-number__mxc-bar': true,
          'gantt-tail-number__mxc-bar_yellow': this.projectedShare > 60,
          'gantt-tail-number__mxc-bar_red': this.projectedShare > 80,
        };
      },
      parsedNextMX() {
        return parseFloat(this.aircraft.next_mx);
      },
      hobbsLeft() {
        const projected = parseFloat(this.projectedHobbs);
        const real = parseFloat(this.aircraft.hobbs);
        const currentHobbs = projected || real;

        if (!this.parsedNextMX || !currentHobbs) return '∞';
        return round(this.parsedNextMX - currentHobbs, 1);
      },
      MXTooltipText() {
        return `${this.aircraft.hobbs} hobbs, ${this.projectedHobbs} projected hobbs,
        previous mx: ${this.aircraft.previous_mx}, next mx: ${this.aircraft.next_mx},
        ${this.hobbsLeft} projected hobbs left, ${this.aircraft.hobbs_left} hobbs left`;
      },
      status() {
        return TAIL_STATUSES[this.aircraft.status];
      },
    },
    methods: {
      ...mapMutations('routeplanningGantt', [
        'setActiveAircraftTab',
        'setFlightAssignment',
        'setLastAssigned',
        'setDetailedViewTail',
      ]),
      share(hobbs) {
        const prevMX = parseFloat(this.aircraft.previous_mx);
        const nextMX = parseFloat(this.aircraft.next_mx);
        const share = hobbs
          ? 100 / (nextMX - prevMX) * (hobbs - prevMX)
          : 0;

        return min([max([0, share]), 100]);
      },
      handleClick() {
        this.setFlightAssignment({
          aircraft: this.flightAssignment.aircraft === this.aircraft.id
            ? null
            : this.aircraft.id,
          flight: null,

          airport: null,
          dateTime: this.filters.dateStart,

          assignmentPosition: AFTER_FLIGHT,
        });
        this.setActiveAircraftTab(this.aircraft.id);
      },
      async handleConflictClick() {
        const firstConflictingFlight = find(this.flights, { isConflicting: true });
        await this.setLastAssigned(firstConflictingFlight);
      },
      showTailNumberView() {
        const { aircraft } = this;

        this.setDetailedViewTail(aircraft.id);
      },
    },
  };
</script>

<template>
  <div :class="classes" @click="handleClick">
    <el-tooltip v-if="conflictCount" effect="dark"
                :content="`${conflictCount} flights conflicting`" placement="top">
      <span @click.stop="handleConflictClick" class="gantt-tail-number__conflict-count">{{ conflictCount }}</span>
    </el-tooltip>

    <span class="gantt-tail-number__reg">
      {{ aircraft.registration }}
      <i v-if="eCheckListMode"
         @click.stop="showTailNumberView" class="fa fa-eye gantt-tail-number__eye" />
    </span>

    <div class="gantt-tail-number__right">
      <div class="gantt-tail-number__status">
        {{ status }}
      </div>
      <el-tooltip effect="dark"
                  :content="MXTooltipText" placement="top">
        <div class="gantt-tail-number__mxc-wrapper">
          <div class="gantt-tail-number__mxc">
            <div :class="actualBarClass" :style="actualBarStyle" />
            <span class="gantt-tail-number__mxc-text">{{ aircraft.hobbs_left }}</span>
          </div>

          <div class="gantt-tail-number__mxc">
            <div :class="projectedBarClass" :style="projectedBarStyle" />
            <span class="gantt-tail-number__mxc-text">{{ hobbsLeft }}</span>
          </div>
        </div>
      </el-tooltip>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .gantt-tail-number {
    font-weight: bold;
    cursor: pointer;
    padding: 0 7px 0 0;
    font-size: 12px;
    display: flex;
    align-items: center;

    &__conflict-count {
      display: inline-flex;
      background: $red;
      color: #fff;
      padding: 0 2px;
      margin-right: 2px;
    }

    &__reg {
      margin: 0 5px;
    }

    &__mxc {
      flex: 0 0 40px;
      height: 15px;
      border-radius: 2px;
      background-color: #d8d8d8;
      overflow: hidden;
      position: relative;
    }

    &__mxc-wrapper {
      width: 85px;
      display: flex;
      justify-content: space-between;
    }

    &__mxc-text {
      color: #fff;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      line-height: 15px;
    }

    &__mxc-bar {
      height: 100%;
      background: $navy;

      &_yellow {
        background: $yellow;
      }

      &_red {
        background: $red;
      }
    }

    &__eye {
      color: $blue;

      &:hover {
        color: $dark-blue;
      }
    }

    &__right {
      margin-left: auto;
      display: flex;
      flex: 0 0 100px;
      justify-content: flex-end;
    }

    &__status {
      margin-right: 5px;
    }
  }
</style>
