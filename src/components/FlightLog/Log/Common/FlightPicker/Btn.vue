<script src="../../../../../store/modules/pilotManifest/pick-flight.js"></script>
<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { DateTime } from 'luxon';
  import { sleep } from 'utils/async';

  import PickFlightModal from './Modal.vue';
  import FlightInfoModal from './FlightInfo.vue';

  export default {
    components: {
      PickFlightModal,
      FlightInfoModal,
    },
    props: {
      disabled: {
        type: Boolean,
        default: false,
      },
      value: {
        type: [Number, Boolean],
        default: false,
      },
      label: {
        type: [String, Boolean],
        default: false,
      },
      flight: {
        type: [Object],
        default: () => ({}),
      },
      filterData: {
        type: Object,
        default: () => ({}),
      },
    },
    methods: {
      ...mapActions('pilotManifest/pickFlight', [
        'setFilterData',
        'reset',
        'getFlightById',
      ]),
      ...mapActions('pilotManifest/editFlight', {
        setFlight: 'setFlight',
        resetEdit: 'reset',
      }),
      handleSelectFlightClick() {
        if (this.flight && this.flight.type_of_operations !== 'Scheduled') {
          this.flightInfoVisible = true;
        } else {
          this.setFilterData(this.filterData);
        }
      },
      handleFlightPick(flight_id) {
        this.reset();
        this.resetEdit();
        this.$emit('input', flight_id);
      },
      goToLog(logId) {
        this.reset();
        this.$router.push({
          name: 'wb_log',
          params: { id: logId },
        });
      },
      async switchToFlightEditing() {
        this.flightInfoVisible = false;
        await sleep(350);// TODO: fix modal body overflow

        this.setFlight(this.flight);
      },
      async switchToFlightSelection() {
        this.flightInfoVisible = false;
        await sleep(350);// TODO: fix modal body overflow

        this.setFilterData(this.filterData);
      },
    },
    data() {
      return {
        flightInfoVisible: false,
      };
    },
  };
</script>

<template>
  <div class="flight-picker">
    <label class="control-label">{{ label }}</label>

    <pick-flight-modal
      :wb-flights="true"
      @wb-log-click="goToLog"
      @input="handleFlightPick" />
    <flight-info-modal
      :visible="flightInfoVisible"
      :flight="flight"
      @click-edit="switchToFlightEditing"
      @click-select="switchToFlightSelection"
      @close="flightInfoVisible = false"
    />

    <el-button
      class="flight-picker__btn"
      size="small"
      type="primary"
      :disabled="disabled"
      @click="handleSelectFlightClick">
      <span v-if="flight">
        <strong>{{ flight.flight_number }}</strong> {{ flight.type_of_operations }}
      </span>
      <span v-else>Pick Flight</span>
    </el-button>
  </div>
</template>

<style lang="scss">
  .flight-picker {
    &__btn {
      width: 100%;
    }
  }
</style>
