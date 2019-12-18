<script>
  import { mapGetters } from 'vuex';
  import {
    TrimPositionNames,
    TRIM_POSITION_DIAMOND,
    TRIM_POSITION_SQUARE,
  } from '../../consts';

  export default {
    props: {
      aircraftType: {
        type: Object,
        default: () => ({}),
      },
    },

    computed: {
      ...mapGetters('wb', ['getCalcValue']),

      kias() {
        return Math.round(this.getCalcValue('totals.maneuvering_speed_kias', 0));
      },

      position() {
        return TrimPositionNames[this.getCalcValue('totals.takeoff_trim_position')];
      },

      positionIcon() {
        const position = this.getCalcValue('totals.takeoff_trim_position');
        return {
          'fa': true,
          'fa-diamond': position === TRIM_POSITION_DIAMOND,
          'fa-square': position === TRIM_POSITION_SQUARE,
        };
      }
    },
  };
</script>

<template>
  <div class="takeoff">
    <div class="takeoff__item takeoff__item_kias">
      <div class="takeoff__label" v-if="aircraftType.name !== 'BE300'">
        Maneuvering Speed (KIAS)
      </div>
      <div class="takeoff__label" v-else>
        Turbulent Air Speed (KIAS)
      </div>
      <div class="takeoff__value">{{ kias || "-" }}</div>
    </div>
    <div class="takeoff__item takeoff__item_trim" v-if="position">
      <div class="takeoff__label">
        Takeoff Trim Position
      </div>
      <div class="takeoff__value">
        <i class="takeoff__icon" :class="positionIcon" />
        {{ position }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .takeoff {
    display: flex;
    flex-flow: column;

    &__item {
      display: flex;
      justify-content: space-between;

      flex: 1 1 100%;
      padding: 15px 0 0;
      background-color: #fff;
    }

    &__label,
    &__value {
      font-size: 1.05em;
      align-self: center;
    }

    &__label {
      font-weight: bold;
    }

    &__value {
      margin-left: 20px;
      white-space: nowrap;
    }

    &__icon {
      margin-right: 5px;
    }
  }
</style>
