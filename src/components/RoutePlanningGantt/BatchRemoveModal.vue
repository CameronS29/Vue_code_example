<script>
  import { mapState, mapMutations, mapActions, mapGetters } from 'vuex';
  import { DateTime } from 'luxon';
  import { take } from 'lodash';

  import Flight from './Flight/BlockView.vue';


  export default {
    components: {
      Flight,
    },
    computed: {
      ...mapState('routeplanningGantt', [
        'batchRemoveRootFlight',
      ]),
      ...mapGetters('routeplanningGantt', [
        'batchRemoveNextFlights',
      ]),
      isActive: {
        get() {
          return !!this.batchRemoveRootFlight;
        },
        set(value) {
          this.setBatchRemoveRootFlight(value);
        },
      },
      flights() {
        return take(this.batchRemoveNextFlights, this.nextFlightCounter);
      },
    },
    methods: {
      ...mapActions('routeplanningGantt', [
        'unAssignFlights',
      ]),
      ...mapMutations('routeplanningGantt', [
        'setBatchRemoveRootFlight',
      ]),
      async handleSubmit() {
        const { flights } = this;
        this.unAssignFlights(flights);

        this.setBatchRemoveRootFlight(false);
      },
    },
    data() {
      return {
        nextFlightCounter: null,
      };
    },
    watch: {
      batchRemoveNextFlights(flights) {
        this.nextFlightCounter = flights.length;
      },
    },
  };
</script>

<template>
  <el-dialog title="Batch remove" :visible.sync="isActive">
    <div class="batch-flight-remove">


      <div class="batch-flight-remove__flights">
        <flight class="aircraft-gantt-sidebar__flight" date-time
                v-for="flight in flights" :flight="flight" :key="flight.id" />
      </div>

      <p class="batch-flight-remove__desc">
        Are you sure you want to unassign next <strong>{{ flights.length }}</strong> flights?
      </p>

      <div class="batch-flight-remove__btns">
        <el-slider
          class="batch-flight-remove__slider"
          v-if="batchRemoveNextFlights.length > 1"
          :min="1"
          :max="batchRemoveNextFlights.length"
          input-size="mini"
          show-input
          v-model="nextFlightCounter" />

        <el-button size="small" type="primary" @click="handleSubmit">Unassign</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<style lang="scss">
  .batch-flight-remove {

    &__flights {
      width: 40vw;
    }

    &__desc {
      opacity: .9;
      font-size: 13px;
    }

    &__btns {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }

    &__slider {
      flex: 1 1;
      margin-right: 20px;
    }
  }
</style>

