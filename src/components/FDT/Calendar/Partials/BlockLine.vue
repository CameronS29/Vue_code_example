<script>
  import { BlockTypes, FlightTypes } from 'store/modules/fdt/consts';
  import LineMixin from '../Mixins/LineMixin';

  export default {
    mixins: [LineMixin],

    props: {
      hovered: { type: Boolean, required: false },
      active: { type: Boolean, required: false },
    },

    data() {
      return {
        BlockTypes,
        FlightTypes,
        hideAirports: false,
      };
    },

    mounted() {
      if (this.block.type === BlockTypes.OCF) {
        return;
      }
      this.$nextTick(() => {
        const containerWidth = this.$el.getBoundingClientRect().width;
        const airportsWidth = this.$refs.airports.scrollWidth;
        this.hideAirports = airportsWidth > 0.98 * containerWidth;
      });
    },

    computed: {
      classes() {
        return {
          'blocktime-line_active': this.active,
          'blocktime-line_illegal': !this.block.is_legal,
          'blocktime-line_part91': this.block.flight_type === FlightTypes.Part91,
          'blocktime-line_ocf': this.block.type === BlockTypes.OCF,
          'blocktime-line_scheduled': this.block.flight_type === FlightTypes.Scheduled,
          'blocktime-line_unscheduled': this.block.flight_type === FlightTypes.Unscheduled,
          'blocktime-line_left-overlap': this.overlaps.left,
          'blocktime-line_right-overlap': this.overlaps.right,
        };
      },

      isReduced() {
        const {
          flown_last_24h: flown,
          current_rest: rest,
          following_rest: follow,
        } = this.block.totals || {};

        return (
          (flown < 8 && rest < 9 && follow >= 10) ||
          (flown >= 8 && flown < 9 && rest < 10 && follow >= 11) ||
          (flown >= 9 && rest < 11 && follow >= 12)
        );
      },

      flight() {
        return this.block.flight || {};
      },

      sandbox() {
        return this.block.sandbox || {};
      },

      origin() {
        return this.flight.origin || this.sandbox.origin_iata;
      },

      destination() {
        return this.flight.destination || this.sandbox.destination_iata;
      },

      flightNumber() {
        return this.flight.flight_number || this.sandbox.flight_number;
      },
    },
  };
</script>

<template>
  <el-tooltip :disabled="!hideAirports" :content="`${origin} → ${destination}`" placement="bottom">
    <div class="blocktime-line" :style="style" @click="$emit('click')" :class="classes">
      <div class="blocktime-line__badges">
        <div class="blocktime-line__badge blocktime-line__badge_single-pilot"
             title="Single Pilot"
             v-if="block.single_pilot">
          SP
        </div>
        <div class="blocktime-line__badge blocktime-line__badge_reduced"
             title="Reduced Rest"
             v-if="isReduced">
          R
        </div>
      </div>

      <div class="calendar__time calendar__time_left" v-if="start === momentOn && block.type === BlockTypes.OCF">
        {{ momentOn.toFormat('HH:mm') }}
      </div>
      <div class="blocktime__ocf" v-if="block.type === BlockTypes.OCF">OCF</div>
      <div class="blocktime-line__flight" v-else>{{ flightNumber }}</div>
      <div v-if="hideAirports" class="route-split route-split_ellipsis">
        &hellip;
      </div>
      <div v-else>
        <div class="route-split" ref="airports">
          <div class="route-split__origin">
            {{ origin }}
          </div>
          <div class="route-split__dest">
            {{ destination }}
          </div>
        </div>
      </div>
      <div class="calendar__time calendar__time_right" v-if="end === momentOff && block.type === BlockTypes.OCF">
        {{ momentOff.toFormat('HH:mm') }}
      </div>
    </div>
  </el-tooltip>
</template>

<style lang="scss">
  @import "../../../../../scss/bs-variables";
  @import "../scss/variables";

  .blocktime-line {
    cursor: pointer;
    background: #2A4053;
    height: 27px;
    z-index: 3;
    position: absolute;
    margin-top: 0;
    color: #fff;
    overflow: hidden;
    padding: 5px 2px;
    transition: background ease-in-out 400ms;
    border-radius: 2px;

    &__flight {
      font-weight: bold;
      font-size: 10px;
      line-height: 7px;
    }

    &_scheduled {
      background: $black;
    }
    &_unscheduled {
      background: $blue;
    }
    &_part91 {
      background: $navy;
    }
    &_active {
      padding: 3px 0 0;
      border: 2px solid darken($navy, 5%);
    }
    &_ocf {
      background: transparentize($ocf-color, .2);
      color: $text-color;
      font-size: 13px;
      font-weight: bold;
      text-transform: uppercase;
      border-radius: 2px;
      overflow: visible;
      margin-top: -1px;
      padding-top: 4px;
      height: 29px;
      border: 1px solid darken($ocf-color, 17%);

      &.blocktime-line_active {
        background: $ocf-color;
        border: 1px solid darken($ocf-color, 25%);
      }

      &.blocktime-line_left-overlap {
        border-left-width: 5px;

        .calendar__time_left {
          @include active-time(left);
        }

        &:hover, &.blocktime-line_active {
          .calendar__time_left {
            opacity: 1;
          }
        }
      }

      &.blocktime-line_right-overlap {
        border-right-width: 5px;

        .calendar__time_right {
          @include active-time(right);
        }

        &:hover, &.blocktime-line_active {
          .calendar__time_right {
            opacity: 1;
          }
        }
      }
    }
    &_illegal {
      background: $red;
    }

    &__badges {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      overflow: hidden;

      font-size: 8px;
      line-height: 10px;
      border-radius: 0 2px;
    }

    &_active &__badges {
      top: -2px;
      right: -2px;
    }

    &__badge {
      color: white;
      background: $yellow;
      padding: 0 2px;

      &_reduced {
        background: rgb(163, 181, 80)
      }
    }
  }

  .route-split {
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    font-size: 10px;
    min-width: 100%;

    &__origin,
    &__dest {
      margin: auto;
    }

    &_ellipsis {
      justify-content: center;
    }
  }
</style>
