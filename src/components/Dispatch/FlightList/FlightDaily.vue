<script>
  import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
  import { DateTime } from 'luxon';

  import DateTimeField from 'Common/Form/Fields/DateTimeField.vue';
  import { ACTIVATE } from 'store/modules/dispatch/status-change';

  import FlightTable from './FlightDailyTable.vue';
  import FlightDetails from '../../Flight/Status/FlightDetails.vue';
  import { connectMixin } from '../../../sockets';

  export default {
    mixins: [connectMixin('flight:list')],
    components: {
      FlightTable,
      FlightDetails,
      DateTimeField,
    },
    computed: {
      ...mapState('dispatch/flight-daily', ['date']),
      ...mapState('dispatch/flight-list/status-change', ['editableFlights']),
      filterDate: {
        get() {
          return this.date;
        },
        set(value) {
          this.setDate(value);
        },
      },
    },
    methods: {
      ...mapMutations('dispatch/flight-daily', ['setDate']),
      ...mapMutations('dispatch/flight-list/status-change', [ACTIVATE]),
      handleMultipleEdit() {
        this[ACTIVATE]();
      },
      handleFlightList() {
        this.$router.push({ name: 'dispatch_dashboard' });
      },
    },
  };
</script>

<template>
  <div class="dispatch-flight-daily">
    <portal to="header">
      <div class="dispatch-flight-daily__header-controls">
        <el-button
          type="primary"
          class="dispatch-flight-daily__edit-multiple"
          @click.stop="handleMultipleEdit"
          v-if="editableFlights.length">Change Status
        </el-button>
        <el-date-picker
          v-model="filterDate"
          :clearable="false"
          format="MM/dd/yyyy"
          value-format="yyyy-MM-dd"
          type="date" />
        <portal-target name="flight-daily-search" />
        <el-button
          icon="el-icon-tickets"
          type="primary"
          class="dispatch-flight-daily__flight-list"
          @click.stop="handleFlightList">Dispatch Dashboard
        </el-button>
      </div>
    </portal>


    <flight-table class="dispatch-flight-daily__table" />
    <flight-details />
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
      margin-left: 10px;
    }
    &__table {
      margin: 0 -25px;
      @media screen and (max-width: $screen-xs-max) {
        margin: 0 -15px;
      }
    }
  }
</style>

