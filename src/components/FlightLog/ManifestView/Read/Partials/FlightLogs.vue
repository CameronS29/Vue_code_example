<script>
  import {mapGetters, mapActions, mapMutations} from 'vuex';
  import Collapse from '../../../../Common/Collapse.vue';
  import Badge from '../../../../Common/Badge.vue';
  import {Table, TableColumn} from 'element-ui';
  import FlightDetails from '../../../../Flight/Status/FlightDetails.vue';
  import {SET_FLIGHT} from 'store/modules/flights';

  export default {
    data() {
      return {
        loaded: false
      };
    },

    props: {
      manifestId: [String, Number],
      hideButtons: Boolean
    },

    created() {
      this.getLogs();
    },

    watch: {
      manifestId() {
        this.getLogs();
      }
    },


    computed: {
      ...mapGetters('manifest/logs', [
        'logs',
      ]),
      ...mapGetters('pilotManifest', [
        'manifest'
      ]),
      logUpdatePathName() {
        const {name} = this.$route;

        if (name.indexOf('dispatch_') > -1) {
          return 'dispatch_log_edit';
        } else if (name.indexOf('fsdo_') > -1) {
          return 'fsdo_log_view';
        } else {
          return 'pilot_log_edit';
        }
      },
      isStatusColumnFixed() {
        if (window.matchMedia('(max-width: 500px)').matches) return false;

        return 'left';
      },
      isActionColumnFixed() {
        if (window.matchMedia('(max-width: 500px)').matches) return false;

        return 'right';
      },
    },

    components: {
      TableEl: Table,
      Collapse,
      TableColumn,
      Badge,
      FlightDetails
    },
    methods: {
      ...mapMutations('flights', [SET_FLIGHT]),
      ...mapActions('flights', ['fetchFlightStatuses']),
      ...mapActions('manifest/logs', [
        'getManifestLogs'
      ]),
      getLogs() {
        this.loaded = false;
        this.getManifestLogs(this.manifestId)
          .finally(() => this.loaded = true);
      },
      showDetailView(flight) {
        this[SET_FLIGHT](flight);
        this.fetchFlightStatuses();
      },
    }
  };
</script>

<template>
  <div class="row">
    <flight-details />
    <div class="col-md-12">
      <collapse title="Flights" :gutterColor="'#1c84c6'" v-loading="!loaded">
        <table-el :data="logs" border
                  style="width: 100%">
          <table-column
            prop="open"
            :fixed="isStatusColumnFixed"
            label="Status"
            align="center"
            minWidth="120"
          >
            <template slot-scope="props">
              <badge :type="props.row.open ? 'success' : 'danger'"
                     :label="props.row.open ? 'Open' : 'Completed'"></badge>
            </template>
          </table-column>
          <table-column
            label="Flight #"
            prop="flight.flight_number"
            sortable
          >
            <template slot-scope="props">
              <el-button @click="showDetailView(props.row.flight)" >
                {{ props.row.flight.flight_number }} <span v-if="props.row.flight.copied">[c]</span>
              </el-button>
            </template>
          </table-column>
          <table-column
            label="Origin"
            prop="flight.origin"
            sortable
          >
            <template slot-scope="props">
              <span :style="{'text-decoration': props.row.flight.actual_origin ? 'line-through' : 'none'}">
                {{ props.row.flight.origin.iata }}
              </span>
              <span v-if="props.row.flight.actual_origin">
                {{ props.row.flight.actual_origin.iata }}
              </span>
            </template>
          </table-column>
          <table-column
            label="Destination"
            prop="flight.destination"
            sortable
          >
            <template slot-scope="props">
              <span :style="{'text-decoration': props.row.flight.actual_destination ? 'line-through' : 'none'}">
                {{ props.row.flight.destination.iata }}
              </span>
              <span v-if="props.row.flight.actual_destination">
                {{ props.row.flight.actual_destination.iata }}
              </span>
            </template>
          </table-column>
          <table-column
            label="Scheduled departure time"
            props="flight.scheduled_departure"
            minWidth="200"
            sortable
          >
            <template slot-scope="props">
              {{props.row.flight.scheduled_departure|longDT}}
            </template>
          </table-column>
          <table-column
            label="Scheduled arrival time"
            props="flight.scheduled_arrival"
            minWidth="200"
            sortable
          >
            <template slot-scope="props">
              {{props.row.flight.scheduled_arrival|longDT}}
            </template>
          </table-column>
          <table-column
            label="Start HOBBS"
            prop="initial_hobbs"
            minWidth="150"
            sortable
          ></table-column>
          <table-column
            label="End HOBBS"
            prop="final_hobbs"
            minWidth="150"
            sortable
          ></table-column>
          <table-column
            label="Flight Time"
            prop="flight_time"
            sortable
          ></table-column>
          <table-column
            label="Block Time"
            prop="block_time"
            sortable
          ></table-column>
          <table-column
            label="Landings"
            prop="total_number_of_landings"
            sortable
          ></table-column>
          <table-column
            label="Fuel Added"
            prop="fuel_add_amount"
            sortable
          ></table-column>
          <table-column
            label="Oil Added"
            prop="oil_add_amount"
            sortable
          ></table-column>
          <table-column
            :fixed="isActionColumnFixed"
            minWidth="100"
            label="Action">
            <template slot-scope="props">
              <router-link
                :to="{ name: logUpdatePathName, params: {id: manifest.id, logId: props.row.id} }"
                title="View Log">
                <i class="fa fa-eye"></i>
              </router-link>
            </template>
          </table-column>
        </table-el>
      </collapse>
    </div>
  </div>
</template>
