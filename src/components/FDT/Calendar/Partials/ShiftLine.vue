<script>
  import { mapMutations } from 'vuex';
  import { HOVER_SHIFT } from 'store/modules/fdt/legality';
  import { DutyTypes, ShiftTypes, DutyTypeNames } from 'store/modules/fdt/consts';
  import LineMixin from '../Mixins/LineMixin';


  export default {
    mixins: [LineMixin],
    props: {
      hovered: { type: Boolean, required: false },
      active: { type: Boolean, required: false },
    },

    data() {
      return {
        DutyTypes,
        ShiftTypes,
      };
    },

    computed: {
      classes() {
        return {
          calendar__shift_hover: this.hovered,
          calendar__shift_active: this.active,
          calendar__shift_ground: this.block.type === 2,
          calendar__shift_hidden: this.momentOn.day !== this.day.day && this.lengthPercent < 0.1,
          'calendar__shift_left-overlap': this.overlaps.left,
          'calendar__shift_right-overlap': this.overlaps.right,
        };
      },

      dutyType() {
        if (this.block.shift !== undefined) {
          return this.block.shift && this.block.shift.name;
        }

        if (this.block.type === ShiftTypes.Other) {
          return DutyTypeNames[this.block.duty_type];
        }

        return '';
      },
    },

    methods: {
      ...mapMutations('fdt/legality', [HOVER_SHIFT]),

      setHover() {
        this[HOVER_SHIFT](this.block.id);
      },
      unsetHover() {
        this[HOVER_SHIFT](null);
      },
    },
  };
</script>

<template>
  <div class="calendar__shift"
       :style="style"
       @mouseenter="setHover"
       @mouseleave="unsetHover"
       :class="classes"
       @click="$emit('click')">
    <div class="calendar__time calendar__time_left" v-if="start === momentOn">
      {{ momentOn.toFormat('HH:mm') }}
    </div>
    <div v-if="block.type === ShiftTypes.Other">{{ dutyType }}</div>
    <div class="calendar__time calendar__time_right" v-if="end === momentOff">
      {{ momentOff.toFormat('HH:mm') }}
    </div>
  </div>
</template>

