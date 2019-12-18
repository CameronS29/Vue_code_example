<script>
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import { Radio } from 'element-ui';
  import ButtonEl from "Common/Button.vue";
  import Collapse from 'Common/Collapse.vue';
  import TableColumn from 'element-ui/lib/table-column';
  import SortableTable from 'Common/SortableTable';
  import {DateTime} from 'luxon';

  export default {
    props: {
      filters: {
        type: Object,
        default: () => ({}),
      },
      securityPick: {
        type: Boolean,
        default: false
      },
      saving: {
        type: Boolean,
        default: false
      },
      wbFlights: {
        type: Boolean,
        default: false,
      },
    },
    components: {
      Collapse,
      SortableTable,
      TableColumn,
      Radio,
      ButtonEl,
    },
    data () {
      return {
        pickedId: null,
        CANCELED: 3,
      }
    },
    methods: {
      dtFormatter(row, column, cellValue) {
        return DateTime.fromISO(cellValue, {zone: 'utc'}).toFormat("kkkk-LL-dd T");
      },
      selected(id) {
        return this.selectedFlightId === id;
      },
      getClassName(item) {
        if (this.wbFlights) {
          return item.row.weightbalancelog ? 'pick-flight-row__highlight' : '';
        } else {
          return (item.row.manifest || !item.row.can_be_picked) ? 'pick-flight-row__highlight' : '';
        }
      },
      picked() {
        this.$emit('flight:picked', this.pickedId);
      }
    },
    computed: {
      disabled() {
        return !this.pickedId || this.saving;
      },
      btnLabel() {
        return this.securityPick ? "Pick Flight" : "Scheduled Flight";
      }
    }
  };
</script>
<template>
  <collapse title="Flights Available" gutterColor="#1c84c6" class="manifest-view-pick-flight">
    <sortable-table
      namespace="pilotManifest/flights"
      :pageSize="10"
      :rowClassName="getClassName"
      :filters="filters"
    >
      <table-column prop="flight_number" label="Flight #" sortable />

      <table-column label="Origin" prop="origin" minWidth="70" sortable="origin__iata"/>

      <table-column label="Dest" prop="destination" minWidth="70" sortable="destination__iata" />

      <table-column label="Departure Time" prop="scheduled_departure" minWidth="100" :formatter="dtFormatter" sortable />

      <table-column label="Arrival Time" prop="scheduled_arrival" minWidth="100" :formatter="dtFormatter" sortable />

      <table-column label="Select" minWidth="80">
        <template slot-scope="props">
          <div v-if="props.row.status === CANCELED">
            Canceled
          </div>
          <div v-else-if="wbFlights">
            <div v-if="props.row.wb_log">
              Flight is already applied to
              <a @click="$emit('wb-log-click', props.row.wb_log)">
                {{ props.row.weightbalancelog }} log
              </a>
            </div>
            <el-radio
              v-else
              v-model="pickedId"
              :label="props.row.id"
              border>&nbsp;
            </el-radio>
          </div>
          <div v-else>
            {{ props.row.manifest }}
            <el-radio v-model="pickedId" :label="props.row.id" v-if="(securityPick || !props.row.manifest) && props.row.can_be_picked" border>&nbsp;</el-radio>
            {{ !props.row.can_be_picked ? 'Flight is not selectable. It is scheduled to depart in more than 14 hours' : ''}}
          </div>
        </template>
      </table-column>
    </sortable-table>

    <button-el :disabled="disabled"
        type="success"
        class="manifest-view-pick-flight__btn"
        @click="picked">
      {{ btnLabel }}
      <i class="fa fa-plus" v-if="!saving"></i>
      <i class="fa fa-circle-o-notch fa-spin fa-1x fa-fw" v-else></i>
    </button-el>
  </collapse>
</template>

<style lang="scss">
  @import '../../../../../../scss/bs-variables';

  .el-table__row.pick-flight-row__highlight {
    background-color: rgb(242, 222, 222);
  }

  .manifest-view-pick-flight {
    &__btn {
      margin-top: 10px;
    }
  }
</style>
