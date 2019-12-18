<script>
  import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
  import FlightModal from './FlightPickerModal.vue';

  import { SET_PICK_MODAL_SHOWN } from 'store/modules/flights';


  export default {
    props: {
      value: {
        type: Array,
        default: () => [],
      },
      showModalOnClick: {
        type: Boolean,
        default: true,
      },
      showFlights: {
        type: Boolean,
        default: true,
      },
      flightFilters: {
        type: Object,
        default: () => ({}),
      },
      modalOptions: {
        type: Object,
        default: () => ({}),
      },
    },
    components: {
      FlightModal,
    },
    computed: {
      ...mapState('flights', ['isFlightPickModalShown']),
    },
    methods: {
      ...mapMutations('flights', [SET_PICK_MODAL_SHOWN]),
      handleSelectFlightClick() {
        if (this.showModalOnClick) {
          this[SET_PICK_MODAL_SHOWN](true);
        }
      },
      handleSelectionChange(flights) {
        this.$emit('input', flights);
      },
    },
  };
</script>

<template>
  <span class="flight-picker-btn">
    <el-button
      size="small"
      type="primary"
      @click="handleSelectFlightClick">
      <span v-if="showFlights && value.length">
        <span class="flight-picker-btn__flight" v-for="flight in value">
          {{ flight.origin.iata }} <strong>{{ flight.flight_number }}</strong> {{ flight.destination.iata }}
        </span>
        <strong>+</strong>
      </span>
      <span v-else><i class="fa fa-plane flight-picker-btn__plane-icon" />
        {{ this.modalOptions.multiple ? 'Pick Flights' : 'Pick Flight' }}
      </span>
    </el-button>

    <flight-modal
      :default-filters="flightFilters"
      v-if="showModalOnClick"
      :selected-flights="value"
      :options="modalOptions"
      @selection-change="handleSelectionChange" />
  </span>
</template>

<style lang="scss">
  .flight-picker-btn {
    &__flight {
      display: inline-block;
      border-bottom: 1px solid #ffffff87;
      padding-bottom: 2px;
      &:not(:last-child) {
        margin-right: 8px;
      }
    }
    &__plane-icon {
      margin-right: 6px;
      font-size: 13px;
    }
  }
</style>
