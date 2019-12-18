<script>
  import { TYPE_OFF, TYPE_PAIR, TYPE_SHIFT, RESERVE_TYPE_ID, TRAVEL_TYPE_ID } from 'store/modules/scheduling/consts';
  import BaseRecord from './BaseRecord.vue';

  const colorTypeMap = {
    [TYPE_OFF]: 'calendar-block__pairing_off',
    [TYPE_PAIR]: 'calendar-block__pairing_pair',
    [TYPE_SHIFT]: 'calendar-block__pairing_shift',
  };

  const colorShiftTypeMap = {
    [RESERVE_TYPE_ID]: 'calendar-block__pairing_reserve-shift',
    [TRAVEL_TYPE_ID]: 'calendar-block__pairing_travel',
  };

  export default {
    name: 'DayRecord',
    components: { BaseRecord },
    props: {
      block: Object,
    },
    computed: {
      classType() {
        return [
          colorTypeMap[this.block.type],
          colorShiftTypeMap[this.block.shift_type],
        ];
      },
    },
  };
</script>

<template>
  <div class="calendar-block__pairing-wrapper">
    <base-record v-once class="calendar-block__pairing" :class="classType">
      {{ block.shortcut }}
    </base-record>

    <div class="calendar-block__badges">
      <span class="calendar-block__missing-pilot"
            title="Missing"
            v-once
            v-if="block.missing_pilot">
        M
      </span>
      <span class="calendar-block__single-pilot"
            title="Single Pilot"
            v-once
            v-if="block.single_pilot">
        SP
      </span>
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../../../../scss/bs-variables';

  .calendar-block {
    &__pairing-wrapper {
      position: relative;
      color: #fff;
    }

    &__pairing {
      background: $navy;

      &_off {
        background: #fff;
        border: 1px solid $navy;
        color: $navy;
        line-height: 18px !important;
      }
      &_shift {
        background-color: $dark-gray;
      }
      &_travel {
        background: lighten($blue, 47%);
        border: 1px solid lighten($blue, 20%);
        color: $blue;
        line-height: 18px !important;
      }
      &_reserve-shift {
        background-color: $--color-warning;
      }
    }

    &__badges {
      position: absolute;
      display: flex;

      top: -2px;
      right: 0;
      height: 9px;

      font-size: 7px;
      font-weight: bold;
      text-align: center;
      line-height: 9px;

      border-radius: 4px;
      overflow: hidden;

      & > * { padding: 0 2px; }
    }

    &__single-pilot {
      background: lighten($orange, 5%);
    }

    &__missing-pilot {
      background: lighten($red, 5%);
    }
  }
</style>
