<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';

  import { TOGGLE_AIRCRAFT_TYPE_DIALOG } from 'store/modules/dispatch/flight-list';
  import Filters from './Filters.vue';
  import FlightTable from './FlightTable.vue';
  import FlightDetails from '../../Flight/Status/FlightDetails.vue';
  import EditFlightModal from '../../FlightLog/ManifestView/Update/EditFlight/Modal.vue';

  import { connectMixin } from '../../../sockets';

  export default {
    props: {
      isFlightsEditable: {
        type: Boolean,
        default: false,
      },
    },
    mixins: [connectMixin('flight:list')],
    components: {
      Filters,
      FlightTable,
      FlightDetails,
      EditFlightModal,
    },
    computed: {
      ...mapState('dispatch/flight-list', ['selectedFlightIds']),
    },
    methods: {
      ...mapActions('pilotManifest/editFlight', {
        closeEditFlightModal: 'reset',
      }),
      ...mapMutations('dispatch/flight-list', [TOGGLE_AIRCRAFT_TYPE_DIALOG]),
      handleFlightList() {
        this.$router.push({ name: 'dispatch_dashboard' });
      },
      handleFlightUpdate() {
        this.closeEditFlightModal();
      },
      handleChangeAircraftTypeClick() {
        this[TOGGLE_AIRCRAFT_TYPE_DIALOG](true);
      },
    },
  };
</script>

<template>
  <div class="dispatch-flight-list">
    <portal to="header">
      <div class="dispatch-flight-daily__header-controls">
        <el-button
          v-if="isFlightsEditable && selectedFlightIds.length"
          type="primary"
          class="dispatch-flight-daily__edit-multiple"
          @click.stop="handleChangeAircraftTypeClick" >Change Aircraft Type
        </el-button>
        <el-button
          v-if="!isFlightsEditable"
          icon="el-icon-tickets"
          type="primary"
          class="dispatch-flight-daily__flight-list"
          @click.stop="handleFlightList">Dispatch Dashboard
        </el-button>
        <portal-target name="flight-list-csv" />
      </div>
    </portal>
    <filters class="dispatch-flight-list__filters" />
    <flight-table :flights-editable="isFlightsEditable" class="dispatch-flight-list__table" />
    <flight-details />
    <edit-flight-modal :create-log="false" @flight:updated="handleFlightUpdate" />
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .dispatch-flight-daily {
    &__header-controls {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      .el-date-editor {
        margin-right: 10px;
      }
      .sortable-table__search {
        margin-bottom: 0;
      }
    }
    &__edit-multiple {
      margin-right: 10px;
    }
    &__flight-list {
      margin-right: 10px;
    }
    &__table {
      margin: 0 -25px;
      @media screen and (max-width: $screen-xs-max) {
        margin: 0 -15px;
      }
    }
  }
</style>

