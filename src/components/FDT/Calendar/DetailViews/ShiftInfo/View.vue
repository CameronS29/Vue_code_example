<script>
  import { DutyTypeNames, ShiftTypes, DutyTypes } from 'store/modules/fdt/consts';
  import { formatDate } from '../Common/utils';

  import ContainerView from '../Common/ContainerView.vue';
  import StatusItem from '../Common/StatusItem.vue';


  export default {
    props: {
      datetime_on: String,
      datetime_off: String,
      type: Number,
      duty_type: Number,
      shift: Object,
      duty: Object,
      pair: Object,
      manifest: Object,
      tz: String,
    },

    components: {
      ContainerView,
      StatusItem,
    },

    computed: {
      opType() {
        switch (this.type) {
          case ShiftTypes.Flying: return 'En Flight';
          case ShiftTypes.Other: return DutyTypeNames[this.duty_type];
          default: return '-//-';
        }
      },
    },

    methods: {
      format(datetime) {
        return formatDate(datetime, this.tz);
      },
    },
  };
</script>

<template>
  <div class="shift__part">
    <div class="shift__part__time shift__part__time_in-out">
      <div class="shift__title">Time IN</div>
      <div class="shift__value">
        {{ format(datetime_on) }}
      </div>
    </div>
    <div class="shift__part__time shift__part__time_in-out">
      <div class="shift__title">Time OUT</div>
      <div class="shift__value">
        {{ format(datetime_off) }}
      </div>
    </div>
    <div class="shift__part__time shift__part__time_typeop">
      <div class="shift__title">Type of Op</div>
      <div class="shift__value shift__value_capitalize">
        {{ opType }}
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .shift__part {
    display: flex;
    margin: 20px;
    min-height: 80px;
    justify-content: space-around;
  }

  .shift__title {
    font-size: 1em;
    font-weight: 600;
    padding: 5px 0;
  }

  .shift__value {
    font-size: 0.9em;

    &._capitalize {
      text-transform: capitalize;
    }
  }
</style>

