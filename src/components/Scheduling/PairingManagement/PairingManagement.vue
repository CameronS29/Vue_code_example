<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { DateTime, Duration } from 'luxon';
  import { isEmpty } from 'lodash';
  import { MessageBox } from 'element-ui';

  import ViewPortal from 'Common/ViewPortal.vue';
  import SearchInput from 'Common/SearchInput.vue';
  import ButtonEl from 'Common/Button.vue';
  import Icon from 'Common/Icon.vue';
  import Block from 'Common/Block.vue';
  import FormattedMonthPicker from 'Common/FormattedMonthPicker.vue';
  import { nullPad } from '../../../utils/date';

  import PairingTable from './PairingTable.vue';
  import PairingAdditionModal from './PairingAdditionModal.vue';
  import RevisionButtons from './RevisionButtons.vue';
  import DraftAdditionPopup from '../Calendar/RevisionHistory/DraftAdditionPopup.vue';
  import FlightTable from '../PairingTemplates/FlightTable.vue';
  import FlightAdditionTable, { tableNamespace as additionTableNamespace }
    from '../PairingTemplates/FlightAdditionTable.vue';
  import ReserveList from './reserve/List.vue';
  import Reserve from './reserve/Entity.vue';
  import ConfirmPatchModal from './ConfirmPatchModal.vue';

  import * as consts from '../../../store/modules/scheduling/consts';
  import { pairingsTableNamespace } from '../../../store/modules/scheduling/pairings';
  import { isValidPairing, sortByDeparture } from '../../../utils/flights';

  export default {
    async created() {
      this.getAllAvailableAirports();

      const { year, month } = DateTime.fromJSDate(this.monthlyPairingDate);
      await this.getRevisions({ year, month });
    },

    components: {
      Block,
      ButtonEl,
      Icon,
      SearchInput,
      ViewPortal,
      FormattedMonthPicker,

      PairingTable,
      FlightTable,
      FlightAdditionTable,
      PairingAdditionModal,
      RevisionButtons,
      DraftAdditionPopup,
      ReserveList,
      Reserve,
      ConfirmPatchModal,
    },

    data() {
      return {
        monthlyPairingDate: DateTime.local().toJSDate(),
        pairingsDate: DateTime.local().toJSDate(),
        baseAirportIATA: [],
        stationAirportIATAs: [],
        plusOneDayEnabled: false,
        pairingsTableNamespace,
        consts,
      };
    },

    computed: {
      ...mapState('scheduling/pairingTemplates/reserve', [
        'editableReserveTemplate',
      ]),

      ...mapState('scheduling/pairings', [
        'editablePairingId',
        'activeTabIndex',
        'conflictContainedShiftId',
        'conflictFlight',
        'lastEditedShiftId',
        'isAffectModalActive',
      ]),

      ...mapGetters('scheduling/pairings', [
        'editablePairing',
        'alreadyAppliedFlights',
        'filterByFlights',
        'isLoading',
      ]),

      ...mapState('scheduling/revisions', ['newlyCreatedFirstDraft', 'hasChanges']),
      ...mapGetters('scheduling/revisions', [
        'activeRevision',
        'isAffectedFlightsExists',
        'activePublished',
        'lastRevision',
      ]),
      ...mapGetters('scheduling/revisions', {
        revisions: 'sortedRevisions',
        revisionsLoading: 'isLoading',
        revisionById: 'byId',
      }),

      ...mapState('scheduling/pairings/reserve', [
        'editableReserveShift',
      ]),

      ...mapGetters('airports', ['airports', 'pilotBases']),

      year() {
        return DateTime.fromJSDate(this.monthlyPairingDate).year;
      },

      month() {
        return DateTime.fromJSDate(this.monthlyPairingDate).month;
      },

      filters() {
        const { year, month } = this;
        const date = DateTime.fromObject({ year, month });
        return {
          base: this.baseAirportIATA,
          station: this.stationAirportIATAs,
          revision: this.activeRevision.id,
          start_date: date.startOf('month').toISODate(),
          end_date: date.endOf('month').toISODate(),
        };
      },

      monthlyPairingMonth() {
        return DateTime.fromJSDate(this.monthlyPairingDate).toFormat('LLL');
      },

      showPairingBlock() {
        const fullWidthBreakPoint = window.matchMedia('(min-width: 992px)');
        if (fullWidthBreakPoint.matches) return true;

        return !this.showArrow;
      },

      activeTab: {
        get() {
          return consts.TABS[this.activeTabIndex];
        },
        set(value) {
          if (value === consts.TABS[this.activeTabIndex]) return;
          this[consts.SET_EDITABLE_RESERVE_SHIFT](null);
          this[consts.SET_ACTIVE_TAB_INDEX](consts.TABS.indexOf(value));
        },
      },

      showArrow() {
        switch (this.activeTabIndex) {
          case 0:
            return this.editablePairingId && this.editablePairing;
          case 1:
          case 2:
          case 3:
            return this.editableReserveShift;
          default:
            return false;
        }
      },

      duty() {
        const flightsLength = this.editablePairing.flights.length;
        if (!flightsLength) return '00:00';

        const minDepartureFlight = this.editablePairing.flights[0];
        const maxArrivalFlight = this.editablePairing.flights[flightsLength - 1];

        const start = DateTime.fromISO(minDepartureFlight.scheduled_departure).toUTC();
        const end = DateTime.fromISO(maxArrivalFlight.scheduled_arrival).toUTC();
        const { hours, minutes } = end.diff(start).plus({ hours: 1 }).shiftTo('hours', 'minutes').toObject();

        return `${nullPad(hours)}:${nullPad(parseInt(minutes))}`;
      },

      blocktime() {
        if (!this.editablePairing.flights.length) return '00:00';

        const sumDiff = this.editablePairing.flights.reduce((acc, flight) => {
          const departure = DateTime.fromISO(flight.scheduled_departure);
          const arrival = DateTime.fromISO(flight.scheduled_arrival);
          return acc.plus(arrival.diff(departure));
        }, Duration.fromObject({ milliseconds: 0 }));

        const { hours, minutes } = sumDiff.shiftTo('hours', 'minutes').toObject();

        return `${nullPad(hours)}:${nullPad(parseInt(minutes))}`;
      },

      flightAdditionTableEndDay() {
        return DateTime
          .fromFormat(this.editablePairing.date, consts.LUXON_US_DATE_FORMAT)
          .plus({ days: 1 })
          .toFormat(consts.LUXON_US_DATE_FORMAT);
      },

      isManualPairingDisabled() {
        return !(this.activeRevision && !isEmpty(this.activeRevision));
      },

      shouldApply() {
        return this.activeRevision.paired_on || this.activeRevision.based_on;
      },
    },

    methods: {
      ...mapActions('airports', ['getAllAvailableAirports']),
      ...mapActions('scheduling/revisions', [
        'createRevision',
        'getRevisions',
        'getRevisionHasChanges',
        'getAffect',
      ]),

      ...mapMutations('scheduling/pairings', [
        consts.SET_ACTIVE_TAB_INDEX,
        consts.CHANGE_EDITABLE_PAIRING,
        consts.TOGGLE_PAIRING_ADDITION_MODAL,
        consts.ADD_FILTER_BY_FLIGHT_ID,
        consts.REMOVE_FILTER_BY_FLIGHT_ID,
        consts.ADD_FLIGHT_TO_PAIRING,
        consts.REMOVE_FLIGHT_FROM_PAIRING,
        consts.SET_CONFLICT_CONTAINED_SHIFT_ID,
        consts.SET_CONFLICT_FLIGHT,
        consts.SET_LAST_EDITED_SHIFT_ID,
        consts.GO_TO_PREVIOUS_EDITABLE,
        consts.TOGGLE_AFFECT_MODAL,
      ]),

      ...mapMutations('scheduling/revisions', [consts.SET_ACTIVE_REVISION]),
      ...mapActions(pairingsTableNamespace, {
        refreshPairingTable: 'refreshResults',
      }),

      ...mapMutations(additionTableNamespace, [
        consts.ADD_FLIGHT_SHIFT,
        consts.REMOVE_FLIGHT_SHIFT,
      ]),

      ...mapMutations('scheduling/pairings/reserve', [
        consts.SET_EDITABLE_RESERVE_SHIFT,
      ]),

      ...mapMutations('scheduling/pairings/update-form', [
        consts.UPDATE_PAIR_FORM,
      ]),

      ...mapActions('scheduling/pairings', [
        'generateMonthlyPairing',
        'patchDraftChanges',
        'patchEditablePairingFlights',
        'removePairing',
        'getShift',
        'splitPair',
      ]),

      ...mapActions('scheduling/pairings/reserve', {
        refreshReserveTables: 'refreshTables',
      }),

      handleToPairingTemplatesClick() {
        this.$router.push({ name: 'scheduling_pairing_templates' });
      },

      handleToCalendarClick() {
        const { year, month } = DateTime.fromJSDate(this.monthlyPairingDate);
        this.$router.push({ name: 'scheduling_calendar', params: { year, month } });
      },

      handleEditPairingClick({ id }) {
        this[consts.CHANGE_EDITABLE_PAIRING](id);
      },

      async handleRevisionApplyChangesClick() {
        if (this.activeRevision && this.shouldApply) {
          await this.getAffect(this.activeRevision.id);

          if (this.isAffectedFlightsExists) {
            this[consts.TOGGLE_AFFECT_MODAL](true);
          } else {
            await MessageBox.alert('Current shifts are is sync with templates. There is nothing to update.');
          }
        } else {
          const dt = DateTime.fromJSDate(this.monthlyPairingDate);
          const message = `Are you sure you want to run monthly shifting for ${dt.toFormat('LLLL, y')}?
          This will create new shifts for selected revision.`;
          await MessageBox.confirm(message, {
            title: 'Run Monthly Shifting',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
          });

          this.runMonthlyShifting();
        }
      },

      async runMonthlyShifting() {
        const { month, year } = DateTime.fromJSDate(this.monthlyPairingDate);

        try {
          await this.patchDraftChanges(this.activeRevision);
          await this.getRevisions({ month, year });

          this.refreshPairingTable();
          this.refreshReserveTables();
        } catch (e) {
          if (e.response && e.response.status === 400) {
            await MessageBox.confirm(`${e.response.data.detail}
             \r\nDo you want to go to Shift Templates and fix them?`, {
              type: 'warning',
              title: 'Collisions detected',
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
            });

            this.$router.push({ name: 'scheduling_pairing_templates' });
          } else {
            throw e;
          }
        }
      },

      handleRevisionClick(id) {
        this[consts.SET_ACTIVE_REVISION](id);
      },

      handleAddManualPairingClick() {
        this[consts.TOGGLE_PAIRING_ADDITION_MODAL](true);
      },

      isActiveRevision({ id }) {
        return this.activeRevision.id === id;
      },

      handleDateChange(date) {
        this.monthlyPairingDate = date;
      },

      handleCloseFlightsClick() {
        if (this.conflictContainedShiftId) {
          this[consts.GO_TO_PREVIOUS_EDITABLE]();
        } else {
          this[consts.CHANGE_EDITABLE_PAIRING](null);
        }
      },

      async handleAddFlight(flight) {
        if (flight.pairs.length) {
          await this.$confirm('Flight already applied to another shift!', 'Warning', {
            confirmButtonText: 'Fix conflict shift',
            cancelButtonText: 'Cancel',
            type: 'warning',
          });

          this[consts.SET_LAST_EDITED_SHIFT_ID](this.editablePairingId);
          this[consts.SET_CONFLICT_CONTAINED_SHIFT_ID](flight.pairs[0]);
          this[consts.SET_CONFLICT_FLIGHT](flight);
        } else {
          this[consts.ADD_FLIGHT_TO_PAIRING]({
            pairing: this.editablePairing,
            flight,
          });
          this[consts.ADD_FLIGHT_SHIFT]({
            shiftId: this.editablePairing.id,
            flightId: flight.id,
          });

          if (isValidPairing(sortByDeparture(this.editablePairing.flights))) {
            await this.patchEditablePairingFlights();
          }
        }
      },

      async handleRemovePairing({ id, name }) {
        await this.$confirm('Are you sure you want to remove this shift?', `Delete Shift ${name}?`, {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning',
        });
        this.removePairing(id);
      },

      handleSplitPairing() {
        return this.splitPair();
      },

      async handleRemoveFlight(flight) {
        this[consts.REMOVE_FLIGHT_FROM_PAIRING]({
          pairing: this.editablePairing,
          flight,
        });
        this[consts.REMOVE_FLIGHT_SHIFT]({
          shiftId: this.editablePairing.id,
          flightId: flight.id,
        });

        if (isValidPairing(sortByDeparture(this.editablePairing.flights))) {
          await this.patchEditablePairingFlights();
        }
      },

      handleRemoveFlightFromFilters(flight) {
        this[consts.REMOVE_FILTER_BY_FLIGHT_ID](flight.id);
      },

      handleAddFlightToFilters(flight) {
        this[consts.ADD_FILTER_BY_FLIGHT_ID](flight.id);
      },

      flightAdditionClientFilter(row) {
        const flightDate = DateTime.fromISO(row.scheduled_departure, { zone: 'UTC' });
        const shiftDate = DateTime.fromFormat(
          this.editablePairing.date,
          consts.LUXON_US_DATE_FORMAT,
          { zone: 'UTC' },
        ).plus({ days: this.plusOneDayEnabled ? 1 : 0 });
        return flightDate.hasSame(shiftDate, 'day');
      },

      async handleApplyPatch() {
        const loading = this.$loading({
          lock: true,
          text: 'Applying...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        });
        try {
          await this.runMonthlyShifting();
        } catch (e) {
          this.$notify.error(e.message);
        } finally {
          this[consts.TOGGLE_AFFECT_MODAL](false);
          loading.close();
        }
      },

      async editPairing() {
        const { id, name, date, base, station } = this.editablePairing;

        this[consts.TOGGLE_PAIRING_ADDITION_MODAL](true);
        this[consts.UPDATE_PAIR_FORM]({
          id,
          name,
          date,
          base,
          station,
        });
      },
    },

    watch: {
      async monthlyPairingDate(date) {
        const { year, month } = DateTime.fromJSDate(date);
        await this.getRevisions({ year, month });
      },

      async editablePairingId(id) {
        if (id && !this.editablePairing) {
          await this.getShift(id);
        }
      },

      newlyCreatedFirstDraft() {
        this.$message({
          message: 'The last Draft successfully removed and New one created instead',
          type: 'success',
          duration: 5e3,
        });
      },

      async activeRevision({ id }) {
        if (id !== undefined) {
          await this.getRevisionHasChanges(id);
        }
      },
    },
  };
</script>

<template>
  <div class="pairing-manage__wrapper">
    <view-portal to="header" min-width="900px">
      <div class="pairing-manage__portalled-controls">
        <formatted-month-picker
          class="pairing-manage__date-picker"
          :year="year"
          :month="month"
          @change="handleDateChange"
        />
        <el-button type="primary" icon="el-icon-date" @click="handleToCalendarClick">Calendar</el-button>
        <el-button type="primary" icon="fa fa-fw fa-cog" @click="handleToPairingTemplatesClick">
          Shift Templates
        </el-button>
        <el-button type="warning"
                   icon="fa fa-fw fa-magic"
                   @click="handleRevisionApplyChangesClick"
                   v-if="!activePublished && shouldApply && hasChanges">
          Apply Changes
        </el-button>
        <el-button type="primary"
                   icon="fa fa-fw fa-magic"
                   @click="handleRevisionApplyChangesClick"
                   v-if="!activePublished && !shouldApply">
          {{ monthlyPairingMonth }} Shifting
        </el-button>
      </div>
    </view-portal>

    <view-portal to="pairing-management-second-column" min-width="991px">
      <div class="pairing-manage__revisions" v-if="revisions.length">
        Revision:
        <span
          v-for="revision in revisions"
          :key="revision.id"
          class="pairing-manage__revision"
          :class="{'pairing-manage__revision_active': isActiveRevision(revision)}"
          @click="handleRevisionClick(revision.id)"
        >
          <span v-if="revision.published">{{ revision.version }}</span>
          <span v-else>D
            <span v-if="revisionById[revision.based_on] !== undefined">
              ({{ revisionById[revision.based_on].version }})
            </span>
          </span>
        </span>
      </div>
    </view-portal>

    <main class="pairing-manage">
      <el-tabs
        type="border-card"
        class="pairing-manage__column"
        v-loading="isLoading || revisionsLoading"
        v-model="activeTab"
        v-if="showPairingBlock"
      >
        <el-tab-pane :label="consts.TABS[0]" :name="consts.TABS[0]">
          <block v-if="activeTabIndex === 0">
            <div class="pairing-manage__pairing-controls" slot="title">
              <button-el
                class="pairing-manage__manual-pairing"
                label="Manual Shifting"
                icon="plus"
                size="m"
                @click="handleAddManualPairingClick"
                :disabled="isManualPairingDisabled"
                v-if="!activePublished"
              />

              <revision-buttons :table-namespace="pairingsTableNamespace"
                                :monthly-pairing-date="monthlyPairingDate" />
            </div>

            <div class="pairing-manage__pairing-filters">
              <el-select class="pairing-manage__base-filter"
                         v-model="baseAirportIATA"
                         size="small"
                         filterable
                         clearable
                         placeholder="Base">
                <el-option v-for="base in pilotBases" :key="base.id" :value="base.iata" />
              </el-select>

              <el-select class="pairing-manage__station-filter"
                         v-model="stationAirportIATAs"
                         size="small"
                         multiple
                         filterable
                         placeholder="Stations">
                <el-option v-for="base in airports" :key="base.id" :value="base.iata" />
              </el-select>

              <portal-target class="pairing-manage__search" name="pairing-table-search-input" />
            </div>

            <pairing-table
              :filters="filters"
              :selected-pairing="editablePairingId"
              search-portal="pairing-table-search-input"
              @edit-pairing-click="handleEditPairingClick"
              @delete-pairing-click="handleRemovePairing"
            />
          </block>
        </el-tab-pane>

        <el-tab-pane :label="consts.TABS[1]" :name="consts.TABS[1]">
          <reserve-list v-if="activeTabIndex === 1"
                        :type="consts.RESERVE_TYPE_ID"
                        :monthly-pairing-date="monthlyPairingDate" />
        </el-tab-pane>
        <el-tab-pane :label="consts.TABS[2]" :name="consts.TABS[2]">
          <reserve-list v-if="activeTabIndex === 2"
                        :type="consts.TRAINING_TYPE_ID"
                        :monthly-pairing-date="monthlyPairingDate" />
        </el-tab-pane>
        <el-tab-pane :label="consts.TABS[3]" :name="consts.TABS[3]">
          <reserve-list v-if="activeTabIndex === 3"
                        :type="consts.OFFICE_TYPE_ID"
                        :monthly-pairing-date="monthlyPairingDate" />
        </el-tab-pane>
        <el-tab-pane :label="consts.TABS[6]" :name="consts.TABS[6]">
          <reserve-list v-if="activeTabIndex === 6"
                        :type="consts.TRAVEL_TYPE_ID"
                        :monthly-pairing-date="monthlyPairingDate" />
        </el-tab-pane>
      </el-tabs>

      <icon
        class="pairing-manage__arrow"
        glyph="arrow-right"
        v-if="showArrow"
      />

      <div class="pairing-manage__column">
        <portal-target name="pairing-management-second-column" />

        <block v-if="editablePairingId && editablePairing && (activeTabIndex === 0)">
          <header class="pairing-manage__block-head" slot="title">
            <div>
              <el-tag v-if="editablePairing.base || editablePairing.station" size="small">
                <strong>{{ editablePairing.base }}</strong>
                <span v-if="editablePairing.station">({{ editablePairing.station }})</span>
              </el-tag>
              {{ editablePairing.name }} Flights on {{ editablePairing.date }} (UTC)
              <button-el @click="editPairing" size="xs" icon="pencil" outline title="Edit" />
            </div>
            <div class="pairing-manage__duties">
              <strong>Duty:</strong> {{ duty }}, <strong>Blocktime:</strong> {{ blocktime }}
            </div>
            <el-button class="pairing-manage__close-flights-btn"
                       size="mini"
                       round
                       @click="handleCloseFlightsClick">{{ lastEditedShiftId ? 'Back' : 'Close' }}
            </el-button>
          </header>

          <flight-table
            :data="editablePairing.flights"
            :editable-mode="true"
            :filter-by-flights="filterByFlights"
            :shift="editablePairing"
            :show-split="true"
            @remove-flight="handleRemoveFlight"
            @remove-from-filters="handleRemoveFlightFromFilters"
            @add-to-filters="handleAddFlightToFilters"
            @split-pair="handleSplitPairing"
          />
        </block>

        <block title="Add Flights"
               v-if="editablePairingId && editablePairing && (activeTabIndex === 0) && !activePublished">
          <el-switch
            slot="title"
            v-model="plusOneDayEnabled"
            active-text="+1 day"
            inactive-text="Current day" />
          <flight-addition-table
            :start-date="editablePairing.date"
            :end-date="flightAdditionTableEndDay"
            :only-scheduled="false"
            :revision="activeRevision.id"
            :client-filter="flightAdditionClientFilter"
            :selected-flights="alreadyAppliedFlights"
            :filter-by-flights="filterByFlights"
            :shift="editablePairing"
            @select-flight="handleAddFlight"
            @remove-flight="handleRemoveFlight"
          />
        </block>

        <reserve v-if="this.editableReserveShift && ([1,2,3,6].indexOf(activeTabIndex) !== -1)" />
      </div>

      <pairing-addition-modal :default-date="pairingsDate" />
      <draft-addition-popup :year="year" :month="month" />
    </main>

    <confirm-patch-modal @apply="handleApplyPatch" v-if="isAffectModalActive" />
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .pairing-manage {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 10px;
    width: 100%;

    &__wrapper {
      display: flex;
      flex-flow: row wrap;
      .pairing-manage__portalled-controls {
        margin-bottom: 10px;
      }
    }

    &__date-picker.date-picker {
      margin-right: 10px;
    }

    .el-table {
      td {
        &:first-child {
          .cell {
            padding-left: 10px;
          }
        }
        &:last-child {
          .cell {
            padding-right: 10px;
          }
        }
      }
    }

    .el-tabs {
      &__nav {
        white-space: normal;
      }
      &__content {
        padding: 0;

        .block {
          margin-bottom: 0;
        }
      }
    }

    .block__contents {
      padding: 0;

      .sortable-table__pagination {
        margin-bottom: 10px;
      }
    }

    .block__title {
      padding: 10px 20px 5px;
      .vue-portal-target {
        margin-left: auto;
      }
    }

    .sortable-table__search {
      margin-bottom: 0;
    }

    &__close-flights-btn {
      margin-left: 10px;
    }

    &__portalled-controls {
      display: flex;
      flex-flow: row wrap;
      > * {
        margin: 5px 0;
        @media screen and (max-width: $screen-xs) {
          width: 100%;
        }
      }
      .date-picker {
        @media screen and (max-width: $screen-xs) {
          width: 100% !important;
          flex: 0 0 100% !important;;
        }
        .formatted-date {
          @media screen and (max-width: $screen-xs) {
            width: calc(100% - 60px) !important;;
            text-align: center !important;;
          }
        }
      }
      .btn {
        margin-left: 10px;
        @media screen and (max-width: $screen-xs) {
          margin-left: 0;
        }
      }
    }

    &__column {
      flex: 0 0 calc(50% - 23px);

      @media screen and (max-width: $screen-md-max) {
        flex: 0 0 calc(50% - 10px);
      }

      @media screen and (max-width: $screen-sm-max) {
        flex: 0 0 100%;
      }
    }

    &__pairing-controls,
    &__pairing-filters {
      display: flex;
      flex-flow: row wrap;
      font-weight: normal;
      width: 100%;

      & > * {
        margin-right: 10px;
        margin-bottom: 5px;
        @media screen and (max-width: $screen-xs) {
          width: 100% !important;
          margin-right: 0;
        }
        &:last-child {
          margin-right: 0;
        }
      }
    }

    &__pairing-filters {
      padding: 10px 18px 5px;
      align-items: center;
    }

    &__manual-pairing {
      margin-right: auto;
    }

    &__revisions {
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
      flex-flow: row wrap;
      margin-bottom: 5px;
    }

    &__revision {
      border-radius: 3px;
      background-color: lighten($text-color, 40%);
      padding: 4px 10px;
      color: $text-color;
      margin-left: 10px;
      cursor: pointer;
      margin-bottom: 5px;

      &_active {
        font-size: 16px;
        background-color: $navy;
        color: #fff;
        padding: 7px 14px;
      }
    }

    &__block-head {
      display: flex;
      align-items: center;
      width: 100%;
    }

    &__base-filter {
      width: 100px;
    }

    &__station-filter {
      width: 180px;
    }

    &__duties {
      margin-left: auto;
      font-weight: normal;
      color: #000;
    }

    &__arrow {
      font-size: 20px;
      margin: 120px 15px 15px;

      @media screen and (max-width: $screen-md-max) {
        display: none;
      }
    }

    &__search {
      margin-left: auto;
    }
  }
</style>

