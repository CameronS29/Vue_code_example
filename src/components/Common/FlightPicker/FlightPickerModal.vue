<script>
  import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';

  import Filters from './Filters.vue';
  import FlightTable from './SortableFlightTable.vue';

  import { SET_PICK_MODAL_SHOWN } from 'store/modules/flights';

  export default {
    components: {
      Filters,
      FlightTable,
    },
    props: {
      options: {
        type: Object,
        default: () => ({
          multiple: false,
        }),
      },
      defaultFilters: {
        type: Object,
        default: () => ({}),
      },
      selectedFlights: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return { selection: this.selectedFlights };
    },
    computed: {
      ...mapState('flights', ['isFlightPickModalShown']),
      show: {
        get() {
          return this.isFlightPickModalShown;
        },
        set(flag) {
          this[SET_PICK_MODAL_SHOWN](flag);
        },
      },
    },
    methods: {
      ...mapMutations('flights', [SET_PICK_MODAL_SHOWN]),
      handleAddSelection(flight) {
        if (this.options.multiple) {
          this.selection = [...this.selection, flight];
        } else {
          this.selection = [flight];
        }

        this.$emit('selection-change', this.selection);
      },
      handleRemoveSelection(flight) {
        if (this.options.multiple) {
          this.selection = this.selection.filter(selectedFlight => selectedFlight.id !== flight.id);
        } else {
          this.selection = [];
        }

        this.$emit('selection-change', this.selection);
      },
    },
  };
</script>

<template>
  <el-dialog :visible.sync="show" class="flight-picker-modal">
    <div class="flight-picker-modal__content">
      <div class="flight-picker-modal__selected-flights">
        <el-button
          :key="flight.id"
          v-for="flight in selection"
          @click="handleRemoveSelection(flight)"
          size="mini" type="danger" icon="el-icon-delete" round>
          {{ flight.origin.iata }} <strong>{{ flight.flight_number }}</strong> {{ flight.destination.iata }}
        </el-button>
      </div>

      <filters
        v-if="show"
        :default="defaultFilters"
        class="flight-picker-modal__filters" />
      <flight-table
        :selected-flights="selectedFlights"
        @add-selection="handleAddSelection"
        @remove-selection="handleRemoveSelection"
        class="flight-picker-modal__table" />
    </div>
  </el-dialog>
</template>

<style lang="scss">
  .flight-picker-modal {
    input {
      border-color: #dcdfe6;
    }

    &__content {
      max-height: calc(100vh - 200px);
      max-width: calc(100vw - 200px);
    }

    &__selected-flights {
      margin-bottom: 15px;
    }

    .el-dialog {
      margin: auto !important;
      &__body {
        padding: 10px;
      }
    }
  }
</style>
