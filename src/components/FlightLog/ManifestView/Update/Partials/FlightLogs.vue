<script>
  import filter from 'lodash/filter';
  import { DateTime } from 'luxon';
  import { mapGetters, mapActions, mapMutations } from 'vuex';
  import GlobalError from 'Common/Form/GlobalError.vue';
  import TableEl from 'element-ui/lib/table';
  import ButtonEl from 'Common/Button.vue';
  import TableColumn from 'element-ui/lib/table-column';
  import Group from 'Common/Form/Group.vue';
  import { SET_FLIGHT } from 'store/modules/flights';
  import { NO_DIVERSION } from 'store/modules/flightlog/consts';
  import manifestApi from 'api/pilotManifest';
  import Collapse from '../../../../Common/Collapse.vue';
  import Loader from '../../../../Common/Loader.vue';
  import Badge from '../../../../Common/Badge.vue';
  import updateManifestMixin from './updateManifestMixin';
  import FlightDetails from '../../../../Flight/Status/FlightDetails.vue';

  export default {
    mixins: [updateManifestMixin],
    data() {
      return {
        loaded: false,
        saving: false,
      };
    },

    props: {
      manifestId: [String, Number],
      hideButtons: Boolean
    },

    created() {
      this.getLogs()
    },

    watch: {
      manifestId() {
        this.getLogs()
      }
    },

    computed: {
      ...mapGetters('manifest/logs', [
        'logs', 'logsSorted', 'isLoading',
      ]),
      ...mapGetters('user', [
        'isAdmin',
      ]),
      ...mapGetters('flightlog', [
        'flightlog',
      ]),
      tableDraw() {
        let logs = this.logsSorted;
        for (let index in this.logsSorted) {
          index = parseInt(index);
          let continues = 0;
          if (this.logsSorted[index].flight.diversion_type !== NO_DIVERSION) {
            if (
              this.logsSorted[index + 1] &&
              this.logsSorted[index + 1].flight.flight_number === this.logsSorted[index].flight.flight_number
            ) {
              continue;
            }
            logs = [
              ...logs.slice(0, index + continues + 1),
              {
                continueFlight: this.logsSorted[index].flight.id,
                log: this.logsSorted[index]
              },
              ...logs.slice(index + continues + 1,),
            ];
            continues += 1;
          }
        }
        return logs;
      },
      logViewPathName() {
        const {name} = this.$route;
        if (name.indexOf('dispatch_') > -1) {
          return 'dispatch_log_edit';
        } else {
          return 'pilot_log_edit';
        }
      },
      logEditPathName() {
        const {name} = this.$route;
        if (name.indexOf('dispatch_') > -1) {
          return 'dispatch_log_edit';
        } else {
          return 'pilot_log_edit';
        }
      },
      isStatusColumnFixed() {
        if (window.matchMedia('(max-width: 600px)').matches) return false;

        return 'left';
      },
      isActionColumnFixed() {
        if (window.matchMedia("(max-width: 600px)").matches) return false;

        return 'right';
      }
    },
    fieldErrors: {
      requiredLogs: (vm) => {
        return `At least one flight log is required to complete manifest.`;
      },
      allCompleted: (vm) => {
        return `This flight manifest cannot be completed with open flight logs. Please complete all the open flight logs before completing this manifest.`;
      },
    },
    globalErrors: ['requiredLogs', 'allCompleted'],
    validations: {
      logs: {
        requiredLogs(logs) {
          return this.validateTryCount && logs.length > 0
        },
        allCompleted(value) {
          return this.validateTryCount && value.length == filter(value, {open: false}).length
        }
      },
    },
    components: {
      Collapse,
      TableEl,
      TableColumn,
      Loader,
      Badge,
      Group,
      GlobalError,
      ButtonEl,
      FlightDetails
    },
    methods: {
      ...mapMutations('flights', [SET_FLIGHT]),
      ...mapActions('pilotManifest', [
        'validateLog',
      ]),
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (row && row.continueFlight) {
          if (columnIndex === 0) {
            return [1, 14];
          } else {
            return [1, 0];
          }
        }
        return [1, 1];
      },
      ...mapActions('flightlog', [
        'patchFlightlog',
        'setPartialUpdate',
      ]),
      ...mapActions('manifest/logs', [
        'getManifestLogs',
      ]),
      ...mapActions('flightlog/delete', [
        'setLog',
      ]),
      ...mapActions('flightlog', [
        'copyFlight',
      ]),
      ...mapActions('flightlog/complete', ['setCompleteLog',]),
      getLogs() {
        this.getManifestLogs(this.manifestId);
      },
      deleteLog(log) {
        this.setLog(log);
      },
      showDetailView(flight) {
        this[SET_FLIGHT](flight);
        this.fetchFlightStatuses();
      },
      async approveReopen(log) {
        await this.$confirm(`Please confirm reopening flight log #${log.flight.flight_number}`, 'Warning', {
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        });
        this.setPartialUpdate({open: true, id: log.id});
        await this.patchFlightlog();
        await this.getManifestLogs(this.manifestId);
        this.$router.push({
          name: 'pilot_log_edit',
          params: {
            logId: log.id,
          },
        });
      },
      addNewLog() {
        this.$emit('addnewlog');
      },
      competeLog(log) {
        this.validateLog(log.id).then(res => {
          if (res.is_valid) {
            this.setCompleteLog(log);
          } else {
            this.$notify({
              type: 'error',
              title: 'Unable to complete Log',
              message: 'This action is invalid. Please click EDIT to fill in all open fields.'
            });
          }
        });
      },
      async handleCopyFlight(flight) {
        const resp = await this.copyFlight(flight.id);

        this.saving = true;
        const logResponse = await manifestApi.createLog({
          manifest: this.manifestId,
          flight: resp.flight_id
        });
        this.saving = false;

        this.$router.push({ name: 'pilot_log_edit', params: { id: this.manifestId, logId: logResponse.id } });
      },
      getSummaries(param) {
        const {columns, data} = param;
        const sums = [];
        columns.forEach((column, index) => {
          if (index === 0) {
            sums[index] = `Total: ${data.length} flights`;
            return;
          }
          if (index >= 9 && index <= 13) {
            const values = data.map(item => Number(item[column.property]));
            sums[index] = values.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0);
          }
        });

        return sums;
      }
    },
  };
</script>

<template>
  <collapse title="Flights" :gutterColor="'#1c84c6'" v-loading="saving">
    <flight-details/>
    <group :no-padding="true" :validation-data="$v.logs"
           v-loading="isLoading">
      <global-error :validation-data="$v"></global-error>
      <table-el :data="tableDraw" border show-summary
                :summary-method="getSummaries"
                :span-method="objectSpanMethod"
                style="width: 100%">
        <table-column
          prop="open"
          :fixed="isStatusColumnFixed"
          label="Status"
          align="center"
          minWidth="120"
        >
          <template slot-scope="props">
            <span v-if="props.row.flight">
              <badge :type="props.row.open ? 'success' : 'danger'"
                     :label="props.row.open ? 'Open' : 'Completed'"></badge>
            </span>
            <span v-else="props.row.continueFlight">
              <el-button type="success" @click="handleCopyFlight(props.row.log.flight)">
                Continue  flight #{{ props.row.log.flight.flight_number }}
              </el-button>
            </span>
          </template>
        </table-column>

        <table-column
          minWidth="150"
          label="Action">
          <template slot-scope="props">
            <span v-if="props.row.flight">
              <button v-if="props.row.open"
                      class="btn btn-xs btn-success"
                      @click="competeLog(props.row)"
                      title="Complete Log">
                <i class="fa fa-check"></i>
              </button>
              <router-link
                v-if="!props.row.open"
                class="btn btn-xs btn-default"
                :to="{ name: logViewPathName, params: {id: manifestId, logId: props.row.id} }"
                title="View Log">
                <i class="fa fa-eye"></i>
              </router-link>
              <router-link
                v-if="props.row.open"
                class="btn btn-xs btn-primary"
                :to="{ name: logEditPathName, params: {id: manifestId, logId: props.row.id} }"
                title="Edit Log">
                <i class="fa fa-edit"></i>
              </router-link>
              <button
                v-if="!props.row.open"
                class="btn btn-xs btn-warning"
                @click="approveReopen(props.row)"
                title="Reopen Log">
                <i class="fa fa-refresh"></i>
              </button>
              <button
                class="btn btn-xs btn-danger"
                v-if="isAdmin || props.row.open"
                @click="deleteLog(props.row)"
                title="Delete Log">
                <i class="fa fa-trash"></i>
              </button>
            </span>
          </template>
        </table-column>

        <table-column
          label="Flight #"
          prop="flight.flight_number"
          sortable
        >
          <template slot-scope="props">
              <span class="flight-list-table__flight-number-btn" v-if="props.row.flight">

                <el-button @click="showDetailView(props.row.flight)">
                  {{ props.row.flight.flight_number }} <span v-if="props.row.flight.copied">[c]</span>
                </el-button>
              </span>
          </template>
        </table-column>
        <table-column
          label="Origin"
          prop="flight.origin"
          sortable
        >
          <template slot-scope="props">
            <div v-if="props.row.flight">
              <span :style="{'text-decoration': props.row.flight.actual_origin ? 'line-through' : 'none'}"
                    v-if="!props.row.flight.actual_origin || props.row.flight.actual_origin.id != props.row.flight.origin.id">
                {{ props.row.flight.origin.iata }}
              </span>
              <span v-if="props.row.flight.actual_origin">
                {{ props.row.flight.actual_origin.iata }}
              </span>
            </div>
          </template>
        </table-column>
        <table-column
          label="Destination"
          prop="flight.destination"
          sortable
        >
          <template slot-scope="props">
            <div v-if="props.row.flight">
              <span :style="{'text-decoration': props.row.flight.actual_destination  ? 'line-through' : 'none'}"
                    v-if="!props.row.flight.actual_destination || props.row.flight.actual_destination.id != props.row.flight.destination.id">
                {{ props.row.flight.destination.iata }}
              </span>
              <span v-if="props.row.flight.actual_destination">
                {{ props.row.flight.actual_destination.iata }}
              </span>
            </div>
          </template>
        </table-column>
        <table-column
          label="Scheduled departure time"
          props="flight.scheduled_departure"
          minWidth="200"
          sortable
        >
          <template slot-scope="props">
            <div v-if="props.row.flight">
              {{props.row.flight.scheduled_departure|longDT}}
            </div>
          </template>
        </table-column>
        <table-column
          label="Scheduled arrival time"
          props="flight.scheduled_arrival"
          minWidth="200"
          sortable
        >
          <template slot-scope="props">
            <div v-if="props.row.flight">
              {{props.row.flight.scheduled_arrival|longDT}}
            </div>
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

      </table-el>
    </group>
    <button-el
      @click="addNewLog"
      label="Add New Flight Log"
      icon="plus"
      type="success"/>
  </collapse>
</template>
<style>
  .el-table__row .is-hidden *{
    visibility: visible;
  }
</style>
