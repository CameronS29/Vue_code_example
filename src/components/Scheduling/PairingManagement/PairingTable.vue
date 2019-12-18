<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { pickBy } from 'lodash';
  import { DateTime } from 'luxon';

  import SortableTable from 'Common/SortableTable';
  import ButtonEl from 'Common/Button.vue';
  import { pairingsTableNamespace } from 'store/modules/scheduling/pairings';
  import { ON_DAY_LINK, NEXT_DAY_LINK, CHANGE_LINKAGE_STATE } from 'store/modules/scheduling/consts';

  import FlightPopover from '../Common/FlightPopover.vue';
  import LinkedPair from '../Calendar/PairBindingModal/LinkedPair.vue';
  import { pairRecordsMixin } from './mixins';

  export default {
    props: {
      isInAdditionMode: {
        type: Boolean,
        default: false,
      },

      isDatesHidden: {
        type: Boolean,
        default: false,
      },

      filters: {
        type: Object,
        default: () => ({}),
      },

      searchPortal: {
        type: [String, Boolean],
        default: false,
      },

      selectedPairing: Number,

      editSinglePilot: {
        type: Boolean,
        default: true,
      },

      rowClassName: {
        type: Function,
        default: () => ({}),
      },
    },

    data() {
      return {
        ON_DAY_LINK,
        NEXT_DAY_LINK,
      };
    },

    mixins: [pairRecordsMixin],

    components: {
      ButtonEl,
      SortableTable,
      FlightPopover,
      LinkedPair,
    },

    computed: {
      ...mapState('scheduling/calendar/pairBinding', ['linkageMap']),
      ...mapGetters('scheduling/calendar/pairBinding', ['activePilot', 'isActivePilotSIC', 'linkedPairsMap',
        'dateTime']),
      ...mapGetters('scheduling/revisions', ['activePublished']),
      ...mapGetters(pairingsTableNamespace, ['results']),

      tableNamespace() {
        return pairingsTableNamespace;
      },

      selectedDay() {
        return this.filters.date && this.filters.date.substr(3, 2);
      },

      onDayDateString() {
        return this.dateTime.toFormat('MM/dd');
      },

      nextDayDateString() {
        return this.dateTime.plus({ days: 1 })
          .toFormat('MM/dd');
      },
    },

    methods: {
      ...mapActions(pairingsTableNamespace, ['setSinglePilot']),
      ...mapMutations('scheduling/calendar/pairBinding', [CHANGE_LINKAGE_STATE]),

      async handleToggleSinglePilot(record) {
        const { id, single_pilot } = record;
        await this.setSinglePilot({
          id,
          isSingle: !single_pilot
        });
      },

      activeRowClass(params) {
        const { row } = params;
        return Object.keys(pickBy({
          'pairing-list__active-row': (row.id === this.selectedPairing),
          'pairing-list__first-row': (
            this.results.length &&
            this.isInAdditionMode &&
            (row.id === this.results[0].id)
          ),
          ...this.rowClassName(params),
        }))
          .join(' ');
      },

      getLinkedPairs(pair) {
        return this.linkedPairsMap[pair.id];
      },

      getSelectedLinkedPair(pair) {
        const state = this.linkageMap[pair.id];

        switch (state) {
          case ON_DAY_LINK:
            return this.getLinkedPairs(pair).on_day;
          case NEXT_DAY_LINK:
            return this.getLinkedPairs(pair).next_day;
          default:
            return null;
        }
      },

      handleLinkageChange(pair, state) {
        this[CHANGE_LINKAGE_STATE]({
          [pair.id]: this.linkageMap[pair.id] === state ? null : state,
        });
      },
    },
  };
</script>

<template>
  <sortable-table
    :namespace="tableNamespace"
    :filters="filters"
    :is-bordered="false"
    :search-portal="searchPortal"
    :row-class-name="activeRowClass"
    query-prefix="pair-"
    :affect-querystring="false"
    searchable="name"
    class="pairing-list"
  >
    <el-table-column type="expand" v-if="isInAdditionMode">
      <template slot-scope="scope">
        <div class="pairing-list__linked" v-if="getLinkedPairs(scope.row)">
          <div class="pairing-list__linked-pair"
               :class="{'pairing-list__linked-pair_active': linkageMap[scope.row.id] === ON_DAY_LINK}"
               v-if="getLinkedPairs(scope.row).on_day">
            <div class="pairing-list__linked-pair-checkbox">

              <el-checkbox :value="linkageMap[scope.row.id] === ON_DAY_LINK"
                           @input="handleLinkageChange(scope.row, ON_DAY_LINK)" />
              <div class="pairing-list__linked-date">{{ onDayDateString }}</div>
            </div>
            <linked-pair :pair="getLinkedPairs(scope.row).on_day" />
          </div>
          <div class="pairing-list__linked-pair"
               :class="{'pairing-list__linked-pair_active': linkageMap[scope.row.id] === NEXT_DAY_LINK}"
               v-if="getLinkedPairs(scope.row).next_day">
            <div class="pairing-list__linked-pair-checkbox">

              <el-checkbox :value="linkageMap[scope.row.id] === NEXT_DAY_LINK"
                           @input="handleLinkageChange(scope.row, NEXT_DAY_LINK)" />
              <div class="pairing-list__linked-date">{{ nextDayDateString }}</div>
            </div>
            <linked-pair :pair="getLinkedPairs(scope.row).next_day" />
          </div>
        </div>
        <div class="pairing-list__no-linked" v-else>There are no linked pairs.</div>
      </template>
    </el-table-column>
    <el-table-column prop="name" width="70">
      <template slot-scope="scope">
        {{ scope.row.name }}
        <span class="pairing-list__linked-pair-name"
              v-if="getSelectedLinkedPair(scope.row)">
          <i class="fa fa-link" />
          {{ getSelectedLinkedPair(scope.row).name }}
        </span>
      </template>
    </el-table-column>

    <el-table-column prop="flights" label="Flights">
      <template slot-scope="scope">
        <flight-popover
          v-for="flight in sortFlights(scope.row.flights)"
          :key="flight.id"
          :flight="flight"
        />
      </template>
    </el-table-column>

    <el-table-column prop="date" label="Date" v-if="!isDatesHidden" width="100" />
    <el-table-column prop="base" label="Base" width="95">
      <template slot-scope="scope">
        <el-tag size="mini" v-if="scope.row.base !== null">
          <strong>{{ scope.row.base }}</strong>
          <span v-if="scope.row.station !== null">({{ scope.row.station }})</span>
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column label="PIC/SIC" v-if="!isInAdditionMode">
      <template slot-scope="scope">
        <div
          v-if="PICAssigned(scope.row)"
          class="pairing-list__pilot-name"><strong>PIC:</strong> {{ PICName(scope.row) }}
        </div>
        <div
          v-if="SICAssigned(scope.row)"
          class="pairing-list__pilot-name"><strong>SIC:</strong> {{ SICName(scope.row) }}
        </div>
      </template>
    </el-table-column>

    <el-table-column label="SP" width="30">
      <template slot-scope="scope">
        <el-switch :value="scope.row.single_pilot"
                   :width="30"
                   @change="handleToggleSinglePilot(scope.row)" />
      </template>
    </el-table-column>

    <el-table-column width="100">
      <template slot-scope="scope">
        <div class="pairing-list__PIC-SIC-assign-btns" v-if="isInAdditionMode">
          <el-tooltip v-if="showPICAssignBtn(scope.row)"
                      :disabled="!PICAssigned(scope.row)"
                      effect="dark"
                      :content="PICRelatedWarningMsg(scope.row)"
                      placement="top">
            <button-el
              size="sm"
              :class="PICBtnClasses(scope.row)"
              :type="PICBtnType(scope.row)"
              :icon="isActivePilotAssignedPIC(scope.row) ? 'check-circle' : null"
              @click="handleAddPairingClick(scope.row, consts.PIC_RANK_ID)">
              {{ isActivePilotAssignedPIC(scope.row) ? '' : consts.PILOT_RANKS[consts.PIC_RANK_ID] }}
            </button-el>
          </el-tooltip>

          <el-tooltip v-if="showSICAssignBtn(scope.row)"
                      :disabled="!SICAssigned(scope.row)"
                      effect="dark"
                      :content="SICRelatedWarningMsg(scope.row)"
                      placement="top">
            <button-el
              size="sm"
              :class="SICBtnClasses(scope.row)"
              :type="SICBtnType(scope.row)"
              :icon="isActivePilotAssignedSIC(scope.row) ? 'check-circle' : null"
              @click="handleAddPairingClick(scope.row, consts.SIC_RANK_ID)">
              {{ isActivePilotAssignedSIC(scope.row) ? '' : consts.PILOT_RANKS[consts.SIC_RANK_ID] }}
            </button-el>
          </el-tooltip>
        </div>
        <div class="pairing-list__VUD-btns" v-else>
          <button-el
            size="sm"
            title="View"
            icon="eye"
            v-if="activePublished"
            class="pairing-list__VUD-btn"
            @click="handleEditPairingClick(scope.row.id)"
          />
          <button-el
            size="sm"
            title="Edit"
            icon="pencil-square-o"
            v-if="!activePublished"
            class="pairing-list__VUD-btn"
            @click="handleEditPairingClick(scope.row.id)"
          />
          <button-el
            title="Delete"
            size="sm"
            type="danger"
            icon="trash"
            v-if="!activePublished"
            class="pairing-list__VUD-btn"
            @click="handleDeletePairingClick(scope.row)"
          />
        </div>
      </template>
    </el-table-column>
  </sortable-table>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .pairing-list {
    &__PIC-SIC-assign-btns {
      display: flex;
      justify-content: flex-end;
    }
    &__PIC-SIC-assign-text {
      display: flex;
      flex-flow: column;
      line-height: 18px;
    }
    &__assign-btn {
      width: 40px;
      margin: 3px 0;
      &_disabled {
        pointer-events: none;
        opacity: .5;
      }
      &:not(:first-child) {
        margin-left: 5px;
      }
    }
    &__VUD-btns {
      display: flex;
      justify-content: flex-end;
    }
    &__VUD-btn {
      &:not(:first-child) {
        margin-left: 5px;
      }
    }

    &__pilot-name {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }

    &__active-row.el-table__row {
      background: transparentize($navy, 0.92);
    }

    &__linked {
      .el-checkbox {
        margin-bottom: 0;
      }
    }

    &__no-linked {
      padding: 5px 15px;
    }

    &__linked-pair {
      display: flex;
      padding: 5px 10px;
      transition: .2s;

      &_active {
        background-color: transparentize($navy, 0.92);
      }
    }

    &__linked-pair-checkbox {
      display: flex;
      align-items: center;
      flex-flow: column;
      margin-right: 5px;
      width: 32px;
      flex: 0 0 32px;
    }

    &__linked-date {
      font-weight: bold;
      font-size: 9px;
    }

    &__linked-pair-name {
      font-size: 10px;
      color: $red;
    }

    .el-table {
      font-size: .95em;

      .cell {
        padding: 0;
      }

      .el-table__row > * {
        padding: 5px 0;
      }
    }

    &__first-row {
      td:first-child {
        color: $navy;
      }
    }
  }
</style>

