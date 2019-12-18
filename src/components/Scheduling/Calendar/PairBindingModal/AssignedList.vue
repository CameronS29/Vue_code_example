<script>
  import { mapState, mapGetters, mapActions } from 'vuex';
  import { get, isEmpty, pick, find } from 'lodash';
  import { DateTime } from 'luxon';

  import ButtonEl from 'Common/Button.vue';
  import { TRAVEL_TYPE_ID, LUXON_US_DATE_FORMAT, SICK_TYPE, HALF_SICK_TYPE } from 'store/modules/scheduling/consts';

  import FlightPopover from '../../Common/FlightPopover.vue';
  import { pairRecordsMixin, reserveRecordsMixin } from '../../PairingManagement/mixins';

  export default {
    props: {
      readOnly: {
        type: Boolean,
        default: false,
      },
    },
    created() {
      this.fetchDetailedRecords();
    },
    data() {
      return {
        SICK_TYPE,
        HALF_SICK_TYPE,
      };
    },
    mixins: [pairRecordsMixin, reserveRecordsMixin],
    components: {
      FlightPopover,
      ButtonEl,
    },
    computed: {
      ...mapState('scheduling/calendar/pairBinding', [
        'detailedRecords',
      ]),
      ...mapGetters('scheduling/calendar/pairBinding', [
        'activePilot',
        'isActivePilotSIC',
        'activeRecords',
        'dateTime',
      ]),
      formattedDate() {
        return this.dateTime.toLocaleString(DateTime.DATE_HUGE);
      },
      paidDayOff: {
        get() {
          return this.activePilot.totals.paid_offs.includes(this.dateTime.day);
        },
        set(value) {
          const date = this.dateTime.toFormat(LUXON_US_DATE_FORMAT);

          if (value) {
            this.addPaidOffs([date]);
          } else {
            this.removePaidOffs([date]);
          }

          this.updateRecords({
            pilots: [this.activePilot.pilot.id],
          });
        },
      },
      sickDay: {
        get() {
          const sickRecord = find(this.activePilot.totals.sick_days, { date: this.dateTime.day });

          return sickRecord ? sickRecord.type : null;
        },
        set(type) {
          const date = this.dateTime.toFormat(LUXON_US_DATE_FORMAT);

          if (type) {
            this.addSickDay([{ date, type }]);
          } else {
            this.removeSickDay([{ date, type: SICK_TYPE }]);
          }

          this.updateRecords({
            pilots: [this.activePilot.pilot.id],
          });
        },
      },

      sickDayClasses() {
        return {
          'assigned-shifts__sick-day': true,
          'assigned-shifts__sick-day_sick': this.sickDay === SICK_TYPE,
          'assigned-shifts__sick-day_half-sick': this.sickDay === HALF_SICK_TYPE,
        };
      },
    },
    methods: {
      ...mapActions('scheduling/calendar/pairBinding', [
        'fetchDetailedRecords',
      ]),
      ...mapActions('scheduling/calendar', [
        'addPaidOffs',
        'removePaidOffs',
        'addSickDay',
        'removeSickDay',
      ]),
      ...mapActions('scheduling/calendar/pilotGrid', ['updateRecords']),


      name(row) {
        return row.name || row.shortcut;
      },
      base(row) {
        return get(row, 'pair.base') || get(row, 'unpaired_shift.base');
      },
      station(row) {
        return get(row, 'pair.station') || get(row, 'unpaired_shift.station');
      },
      recordToPairView(record) {
        return {
          ...record.pair,
          record,
        };
      },

      showTravelEditBtn(shift) {
        return get(shift, 'shift_type') === TRAVEL_TYPE_ID;
      },

      handleUnassignClick(record) {
        this.$emit('unassign-click', record);
      },

      handleTravelEditClick(shift) {
        this.$emit('travel-edit', pick(shift, [
          'id', 'shortcut', 'duty_on', 'duty_off',
        ]));
      },
    },

    watch: {
      activeRecords(val) {
        if (!isEmpty(val)) {
          this.fetchDetailedRecords();
        }
      },
    },
  };
</script>

<template>
  <div class="assigned-shifts" v-if="activeRecords.length">
    <h3 class="assigned-shifts__header">
      {{ formattedDate }}
      <div class="assigned-shifts__modifiers">
        <div class="assigned-shifts__paid-off">
          <el-switch v-model="paidDayOff" :disabled="readOnly" active-text="Paid off" />
        </div>
        <div :class="sickDayClasses">
          <el-select v-model="sickDay" size="mini" placeholder="Select">
            <el-option :key="null" label="Well" :value="null"/>
            <el-option :key="HALF_SICK_TYPE" label="Half Sick" :value="HALF_SICK_TYPE"/>
            <el-option :key="SICK_TYPE" label="Sick" :value="SICK_TYPE"/>
          </el-select>
        </div>
      </div>
    </h3>
    <el-table size="mini" :data="detailedRecords" style="width: 100%">
      <el-table-column width="70">
        <template slot-scope="scope">
          {{ name(scope.row) }}
        </template>
      </el-table-column>

      <el-table-column>
        <template slot-scope="scope">
          <div v-if="scope.row.pair">
            <flight-popover
              v-for="flight in sortFlights(scope.row.pair.flights)"
              :key="flight.id"
              :flight="flight"
            />
          </div>
          <div v-if="scope.row.unpaired_shift">
            {{ formatTime(scope.row.unpaired_shift) }}
          </div>
        </template>
      </el-table-column>

      <el-table-column width="95">
        <template slot-scope="scope">
          <el-tag size="mini" v-if="base(scope.row)">
            <strong>{{ base(scope.row) }}</strong>
            <span v-if="station(scope.row)">({{ station(scope.row) }})</span>
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column>
        <template slot-scope="scope">
          <div class="assigned-shifts__PIC-SIC-assign-text" v-if="readOnly">
            <span v-if="PICAssigned(scope.row)"><strong>PIC:</strong> {{ PICName(scope.row) }}</span>
            <span v-if="SICAssigned(scope.row)"><strong>SIC:</strong> {{ SICName(scope.row) }}</span>
          </div>
          <div class="pairing-list__PIC-SIC-assign-btns" v-else>
            <el-tooltip v-if="scope.row.pair && showPICAssignBtn(scope.row)"
                        :disabled="!PICAssigned(scope.row)"
                        effect="dark"
                        :content="PICRelatedWarningMsg(scope.row)"
                        placement="top">
              <button-el
                size="sm"
                :class="PICBtnClasses(scope.row)"
                :type="PICBtnType(scope.row)"
                :icon="isActivePilotAssignedPIC(scope.row) ? 'check-circle' : null"
                @click="handleAddPairingClick(recordToPairView(scope.row), consts.PIC_RANK_ID)">
                {{ isActivePilotAssignedPIC(scope.row) ? '' : consts.PILOT_RANKS[consts.PIC_RANK_ID] }}
              </button-el>
            </el-tooltip>

            <el-tooltip v-if="scope.row.pair && showSICAssignBtn(scope.row)"
                        :disabled="!SICAssigned(scope.row)"
                        effect="dark"
                        :content="SICRelatedWarningMsg(scope.row)"
                        placement="top">
              <button-el
                size="sm"
                :class="SICBtnClasses(scope.row)"
                :type="SICBtnType(scope.row)"
                :icon="isActivePilotAssignedSIC(scope.row) ? 'check-circle' : null"
                @click="handleAddPairingClick(recordToPairView(scope.row), consts.SIC_RANK_ID)">
                {{ isActivePilotAssignedSIC(scope.row) ? '' : consts.PILOT_RANKS[consts.SIC_RANK_ID] }}
              </button-el>
            </el-tooltip>

            <button-el
              icon="pencil"
              title="Edit"
              class="pairing-list__assign-btn"
              v-if="showTravelEditBtn(scope.row.unpaired_shift)"
              @click="handleTravelEditClick(scope.row.unpaired_shift)"
            />

            <button-el
              type="danger"
              title="Delete"
              icon="trash-o"
              class="pairing-list__assign-btn"
              @click="handleUnassignClick(scope.row)"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .assigned-shifts {
    &__header {
      padding: 8px 8px 5px;
      margin: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    &__PIC-SIC-assign-text {
      display: flex;
      flex-flow: column;
      line-height: 18px;
    }
    &__modifiers {
      display: flex;
      align-items: center;

      label {
        margin-bottom: 0;
      }

      .el-checkbox-button--mini .el-checkbox-button__inner {
        padding: 5px 10px;
      }
    }
    &__paid-off {
      margin-right: 10px;
    }
    &__sick-day {
      width: 95px;

      &_half-sick {
        .el-input__inner {
          border-color: $brand-warning;
        }
      }

      &_sick {
        .el-input__inner {
          border-color: transparentize($red, .3);
        }
      }
    }
    .el-table {
      &__header {
        display: none;
      }

      td {
        padding: 3px 0;

        &:first-child .cell {
          padding-left: 5px;
        }
        &:last-child .cell {
          padding-right: 5px;
        }
      }
    }
  }
</style>
