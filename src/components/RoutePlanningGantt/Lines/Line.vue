<script>
  import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
  import { throttle } from 'lodash';

  import Flight from './Flight.vue';
  import FlightAddition from './FlightAddition.vue';

  export default {
    props: {
      line: {
        type: Object,
        required: true,
      },
    },
    components: {
      FlightAddition,
      Flight,
    },
    computed: {
      ...mapState('routeplanningGantt/lines', [
        'lines',
        'flights',
        'activeLineId',
      ]),
      ...mapGetters('routeplanningGantt/lines', [
        'flightMap',
      ]),
      name: {
        get() {
          return this.line.name;
        },
        set: throttle(function (name) {
          this.patchLine({
            id: this.line.id,
            name,
          });
        }, 500, {
          leading: false,
          trailing: true,
        }),
      },
      isCurrentLineActive() {
        return this.activeLineId === this.line.id;
      },
      sortedFlightNumbers() {
        return this.line.flight_numbers.sort();
      },
      lastFlightId(){

      },
    },
    methods: {
      ...mapMutations('routeplanningGantt/lines', [
        'setActiveLine',
      ]),
      ...mapActions('routeplanningGantt/lines', [
        'getLines',
        'deleteLine',
        'patchLine',
        'removeFlightFromActiveLine',
        'removeFlightFromLine',
      ]),
      handleSearchClick() {
        this.setActiveLine(this.isCurrentLineActive ? null : this.line.id);
      },
      async handleDeleteClick() {
        await this.$confirm('This will permanently delete the line. Continue?', 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        });

        this.deleteLine(this.line.id);
      },
      handleRemoveFlight(flight) {
        const { line } = this;

        this.removeFlightFromLine({
          flight,
          line,
        });
      },
    },
  };
</script>

<template>
  <div class="flight-number-line">
    <div class="flight-number-line__current">
      <div class="flight-number-line__name">
        <el-input v-model="name" />
      </div>
      <div class="flight-number-line__flights" v-if="flights.length">
        <flight :remove-btn="true"
                :flight="flightMap[flight_number]"
                @remove-click="handleRemoveFlight"
                :key="flight_number"
                v-for="flight_number in sortedFlightNumbers" />
      </div>
      <div class="flight-number-line__control-btns">
        <el-button @click="handleSearchClick"
                   type="primary" icon="el-icon-search" class="flight-number-line__control-btn" />
        <el-button @click="handleDeleteClick"
                   type="danger" icon="el-icon-delete" class="flight-number-line__control-btn" />
      </div>
    </div>

    <flight-addition v-if="isCurrentLineActive" />
  </div>
</template>

<style lang="scss">
  .flight-number-line {
    border-radius: 8px;
    background-color: #ffffff;
    border: solid 1px #d1d1d1;
    margin-bottom: 7px;

    &__current {
      display: flex;
      height: 77px;
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 2px 4px 0 rgba(171, 171, 171, 0.5);
    }
    &__name {
      background-color: #eff6f6;
      display: flex;
      align-items: center;
      padding: 0 20px;
      box-shadow: 1px 0 9px 0 rgba(0, 0, 0, 0.23);
      .el-input {
        width: 100px;
      }
    }
    &__flights {
      flex: 1 1;
      padding: 0 7px;
      overflow-x: auto;
      overflow-y: hidden;
      display: flex;
      align-items: center;
    }
    &__control-btns {
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5), -2px 0 11px 0 rgba(0, 0, 0, 0.16);
      display: flex;
    }
    &__control-btn {
      height: 100%;
      border-radius: 0;
      margin: 0 !important;
    }
  }
</style>
