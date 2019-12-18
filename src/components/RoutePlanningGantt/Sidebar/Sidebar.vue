<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { take } from 'lodash';

  import FlightDesc from './FlightDesc.vue';
  import FlightLine from './FlightLine.vue';
  import Flight from '../Flight/BlockView.vue';
  import AddUnscheduledModal from '../../FlightLog/Log/Common/FlightPicker/AddUnscheduledModal.vue';

  export default {
    async created() {
      if (!this.sortedLines.length) {
        await this.getLines();
      }
    },
    components: {
      FlightDesc,
      FlightLine,
      Flight,
      AddUnscheduledModal,
    },
    computed: {
      ...mapState('routeplanningGantt', [
        'eCheckListMode',
      ]),
      ...mapGetters('routeplanningGantt', [
        'isFlightAssignmentValid',
        'suggestedFlights',
      ]),
      ...mapGetters('routeplanningGantt/lines', [
        'sortedLines',
      ]),
      ...mapGetters('airports', [
        'byIATA',
      ]),
      flights() {
        if ((this.suggestedFlights.length > 50) && !this.isFullFlightListShow) {
          return take(this.suggestedFlights, 30);
        }

        return this.suggestedFlights;
      },
      expandBtnShown() {
        return !this.isFullFlightListShow && (this.suggestedFlights.length > this.flights.length);
      },
    },
    methods: {
      ...mapMutations('routeplanningGantt', [
        'resetFlightAssignment',
        'setLastAssigned',
      ]),
      ...mapActions('routeplanningGantt', [
        'assignFlight',
      ]),
      ...mapActions('routeplanningGantt/lines', [
        'getLines',
      ]),
      close() {
        this.resetFlightAssignment();
      },
      async handleArrowClick(flight) {
        await this.assignFlight(flight);
        await this.setLastAssigned(flight);
      },
      showFullFlightList() {
        this.isFullFlightListShow = true;
      },
      showAddUnscheduledModal() {
        this.unscheduledAddition = true;
      },
      async addUnscheduled(flight) {
        flight = {
          ...flight,
          destination: this.byIATA(flight.destination),
          origin: this.byIATA(flight.origin),
        };

        this.unscheduledAddition = false;
        await this.assignFlight(flight);
        await this.setLastAssigned(flight);

      },
    },
    data() {
      return {
        isFullFlightListShow: false,
        unscheduledAddition: false,
      };
    },
    watch: {
      suggestedFlights() {
        this.isFullFlightListShow = false;
      },
    },
  };
</script>

<template>
  <section class="aircraft-gantt-sidebar" v-if="isFlightAssignmentValid">
    <header class="aircraft-gantt-sidebar__header">
      <h3 class="aircraft-gantt-sidebar__title">
        Flight Assignment
        <el-button icon="el-icon-circle-plus"
                   @click="showAddUnscheduledModal"
                   class="aircraft-gantt-sidebar__add-unscheduled" type="primary" size="mini">
          Unscheduled
        </el-button>

        <add-unscheduled-modal @added="addUnscheduled"
                               @close="unscheduledAddition = false" :active="unscheduledAddition" />
      </h3>
      <el-button class="aircraft-gantt-sidebar__close" icon="el-icon-close" circle size="mini" @click="close" />
    </header>
    <div class="aircraft-gantt-sidebar__flights">
      <div class="aircraft-gantt-sidebar__desc">
        <flight-desc />
      </div>

      <flight class="aircraft-gantt-sidebar__flight" show-plus date-time
              @plus-click="handleArrowClick"
              v-for="flight in flights" :flight="flight" :key="flight.id" />
    </div>
    <div class="aircraft-gantt-sidebar__show-full-list" v-if="expandBtnShown">
      <el-button @click="showFullFlightList" size="mini" round>
        Show all <strong>{{ suggestedFlights.length }}</strong>
      </el-button>
    </div>

    <div class="aircraft-gantt-sidebar__lines" v-if="!eCheckListMode">
      <flight-line :key="line.id" :line="line" v-for="line in sortedLines" />
    </div>
  </section>
</template>

<style lang="scss">
  .aircraft-gantt-sidebar {
    flex: 0 0 450px;
    overflow-y: auto;
    background: #fff;
    padding: 10px 15px;
    z-index: 100;
    box-shadow: -10px 0px 20px rgba(0, 0, 0, .1);

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-weight: bold;
    }

    &__title {
      margin: 0;
      font-weight: bold;
    }

    &__add-unscheduled {
      margin-left: 10px;
      padding: 5px 10px;
    }

    &__close {
    }

    &__desc {
      float: right;
      display: flex;
      flex-flow: column;
    }

    &__flight {
      display: inline-block;
      margin-right: 10px;
      margin-bottom: 5px;
    }

    &__lines {
      padding: 5px 0;
      clear: both;
    }
  }
</style>
