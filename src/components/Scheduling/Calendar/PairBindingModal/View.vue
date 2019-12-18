<script>
  import { mapActions, mapMutations, mapGetters, mapState } from 'vuex';
  import { MessageBox } from 'element-ui';
  import { find, get, map, maxBy, isEmpty, compact } from 'lodash';
  import { DateTime } from 'luxon';

  import ButtonEl from 'Common/Button.vue';
  import Modal from 'Common/Modal.vue';

  import { pairingsTableNamespace } from 'store/modules/scheduling/pairings';
  import * as consts from 'store/modules/scheduling/consts';

  import Block from '../PilotList/Records/DayRecord.vue';
  import PairingTable from '../../PairingManagement/PairingTable.vue';
  import ReserveTable from '../../PairingManagement/reserve/ReserveTable.vue';
  import OffSection from './OffSection.vue';
  import AssignedList from './AssignedList.vue';
  import TravelForm from './TravelForm.vue';

  const BOTTOM_OFFSET = 400;

  export default {
    components: {
      ButtonEl,
      Block,
      Modal,
      PairingTable,
      ReserveTable,
      OffSection,
      AssignedList,
      TravelForm,
    },

    async created() {
      await this.fetchDayOffTypes();
      window.addEventListener('keydown', this.handleKeyboard);
    },

    mounted() {
      this.focusSearchField();
    },

    destroyed() {
      window.removeEventListener('keydown', this.handleKeyboard);
    },

    data() {
      return {
        consts,
        activeTab: consts.TABS[0],
      };
    },

    computed: {
      ...mapState('scheduling/pairingTemplates/off', ['dayOffTypes']),
      ...mapState('scheduling/calendar', [
        'year',
        'month',
        'showAssignedFlightsDate',
        'showFDTCalendarPilot',
      ]),
      ...mapGetters('airports', ['byIATA']),
      ...mapGetters('scheduling/calendar', ['isLoading']),
      ...mapGetters('scheduling/revisions', [
        'activeRevision',
        'activePublished',
        'hasInitial',
      ]),
      ...mapGetters('scheduling/calendar/pilotGrid', ['pilotRecordMap', 'daysOffByPilotId']),
      ...mapState('scheduling/calendar/pairBinding', ['pilotId']),
      ...mapGetters('scheduling/calendar/pairBinding', [
        'activePilot',
        'isActivePilotSIC',
        'activeRecords',
        'isPairBindingVisible',
        'coordinates',
        'date',
        'dateTime',
        'dateRange',
        'selectedLinkedPair',
      ]),
      ...mapGetters(pairingsTableNamespace, {
        pairingTableRecords: 'results',
        pairingTableIsLoading: 'pending',
      }),
      ...mapGetters('pilots', ['pilotById']),

      filters() {
        const filters = {
          revision: this.activeRevision.id,
          date: this.date,
          pilot: this.pilotId,
        };

        this.fetchLinked(filters);
        return filters;
      },

      reserveFilters() {
        return {
          revision: this.activeRevision.id,
          date: this.date,
        };
      },

      selectedShiftNames() {
        return map(this.activeRecords, 'shortcut');
      },

      dayOff() {
        return find(this.activeRecords, { type: consts.TYPE_OFF });
      },

      isOffPromptEnabled() {
        return this.activeRecords.length > 0 && !this.dayOff;
      },

      isTopPositioned() {
        if (this.isSmallScreen) return false;
        const mainHeight = document.querySelector('.fltops-app').offsetHeight;

        return parseInt(this.coordinates.y) + BOTTOM_OFFSET > mainHeight;
      },

      classes() {
        return {
          'pair-binding-modal': true,
          _bulkDayOFFs: !this.date,
          _top: this.isTopPositioned,
        };
      },

      pairListStyles() {
        if (!this.isTopPositioned) return null;

        return { bottom: `${(this.activeRecords.length + 2) * 20}px` };
      },

      isSmallScreen() {
        return window.matchMedia('(max-width: 992px)').matches;
      },

      maxSuggestedScore() {
        return get(maxBy(this.pairingTableRecords, 'score'), 'score', 0);
      },

      canKeyboardBind() {
        return !this.pairingTableIsLoading && this.isPairBindingVisible;
      },

      isReadOnly() {
        return this.activePublished
          || (this.dateTime < DateTime.utc().startOf('day') && this.hasInitial);
      },
    },

    methods: {
      ...mapActions('scheduling/calendar', [
        'bindPairings',
        'bindShift',
        'deleteRecord',
        'deleteRecordPart',
        'bindDayOFF',
        'removeRecordsInSelectedRange',
        'addPaidOffs',
        'removePaidOffs',
      ]),

      ...mapActions('scheduling/calendar/pilotGrid', ['updateRecords']),
      ...mapActions('scheduling/calendar/pairBinding', ['closePairBinding', 'showPairBinding', 'fetchLinked']),
      ...mapActions('scheduling/pairingTemplates/off', ['fetchDayOffTypes']),
      ...mapActions('scheduling/pairings/reserve', ['saveReserveShift']),
      ...mapMutations('scheduling/pairings/reserve', [consts.SET_EDITABLE_RESERVE_SHIFT]),
      ...mapActions('scheduling/assignedFlights', [
        'getAssignedFlightStatus',
        'getAssignedFlights',
        'getAssignedPairs',
      ]),
      ...mapActions('fdt/calendar', ['getLegality']),
      ...mapActions(pairingsTableNamespace, ['refreshResults']),

      notifyError(title, { message }) {
        this.$notify.error({ title, message });
      },

      async refreshAssignedFlightsIfNeeds() {
        this.getAssignedFlightStatus();

        if (this.date !== null && this.dateTime.toISODate() === this.showAssignedFlightsDate) {
          this.getAssignedFlights(this.showAssignedFlightsDate);
          this.getAssignedPairs(this.showAssignedFlightsDate);
        }
      },

      async refreshFDTCalendarIfNeeds() {
        if (this.showFDTCalendarPilot && this.showFDTCalendarPilot.id === this.activePilot.pilot.id) {
          await this.getLegality();
        }
      },

      getWarningMsg(pair, type) {
        const msg = [];
        if (pair.record) {
          const pilot = type === consts.PIC_RANK_ID ? pair.record.pilot : pair.record.sic;

          if (pilot) {
            msg.push(`${pilot.first_name} ${pilot.last_name} from ${pair.name}`);
          }
        }

        const linkedPair = this.selectedLinkedPair(pair);
        if (linkedPair) {
          const linkedPilotId = type === consts.PIC_RANK_ID ? linkedPair.pic : linkedPair.sic;
          const linkedPilot = this.pilotById(linkedPilotId);

          if (linkedPilot) {
            msg.push(`and  ${linkedPilot.first_name} ${linkedPilot.last_name} from ${linkedPair.name}`);
          }
        }

        return ['You are removing ', msg.join(', ')].join('');
      },

      async handleAddPairingClick({ pairing, type }) {
        const { pilotId } = this;
        const linkedPair = this.selectedLinkedPair(pairing);
        const picId = get(pairing.record, 'pilot.id');
        const sicId = get(pairing.record, 'sic.id');

        const isRewriting = (type === consts.PIC_RANK_ID && (picId || (linkedPair && linkedPair.pic)))
          || (type === consts.SIC_RANK_ID && (sicId || (linkedPair && linkedPair.sic)));

        const dayOffsForReassign = this.daysOffByPilotId(pilotId, compact([pairing, linkedPair])
          .map(({ date }) => date));

        // msg about pilot conflict
        if (isRewriting) {
          await MessageBox.confirm(this.getWarningMsg(pairing, type), { type: 'warning' });
        }

        // msg about paid off
        if (dayOffsForReassign.length) {
          try {
            await MessageBox.confirm('Do you want to assign as paid day off?', {
              type: 'warning',
              cancelButtonText: 'No',
              confirmButtonText: 'Yes',
            });
            await this.addPaidOffs(dayOffsForReassign.map(off => off.date));
          } catch (e) {
            console.error(e);
          }
        }

        try {
          const assignData = [];

          if (type === consts.PIC_RANK_ID) {
            assignData.push({
              pair: pairing.id,
              pic: pilotId,
              sic: sicId === pilotId ? null : undefined,
            });
            if (linkedPair) {
              assignData.push({
                pair: linkedPair.id,
                pic: pilotId,
                sic: linkedPair.sic === pilotId ? null : undefined,
              });
            }
          }

          if (type === consts.SIC_RANK_ID) {
            assignData.push({
              pair: pairing.id,
              pic: picId === pilotId ? null : undefined,
              sic: pilotId,
            });
            if (linkedPair) {
              assignData.push({
                pair: linkedPair.id,
                pic: linkedPair.pic === pilotId ? null : undefined,
                sic: pilotId,
              });
            }
          }

          await this.bindPairings(assignData);
        } catch (e) {
          this.notifyError('Error creating assignment', e);
        } finally {
          const linkedPilotIds = linkedPair ? [linkedPair.pic, linkedPair.sic] : [];
          await Promise.all([
            this.updateRecords({
              pilots: [pilotId, picId, sicId, ...linkedPilotIds],
            }),
            this.refreshResults(),
            this.fetchLinked(this.filters),
            this.refreshAssignedFlightsIfNeeds(),
            this.refreshFDTCalendarIfNeeds(),
          ]);
        }
      },

      async submitTheOnlyPairing() {
        const pairing = this.pairingTableRecords[0] || {};
        const linkedPair = this.selectedLinkedPair(pairing);
        const { record } = pairing;
        const picId = get(pairing.record, 'pilot.id');
        const sicId = get(pairing.record, 'sic.id');

        const { pilotId, isActivePilotSIC } = this;
        const assignData = [];

        if (!isActivePilotSIC) {
          if (record === null || record.pilot === null) {
            assignData.push({
              pair: pairing.id,
              pic: pilotId,
            });
          }
          if (linkedPair && !linkedPair.pic) {
            assignData.push({
              pair: linkedPair.id,
              pic: pilotId,
            });
          }
        } else if (isActivePilotSIC) {
          if (record === null || record.sic === null) {
            assignData.push({
              pair: pairing.id,
              sic: pilotId,
            });
          }
          if (linkedPair && !linkedPair.sic) {
            assignData.push({
              pair: linkedPair.id,
              sic: pilotId,
            });
          }
        }

        if (!isEmpty(assignData)) {
          await this.bindPairings(assignData);
          const linkedPilotIds = linkedPair ? [linkedPair.pic, linkedPair.sic] : [];

          this.updateRecords({ pilots: [pilotId, picId, sicId, ...linkedPilotIds] });
          this.fetchLinked(this.filters);
          this.refreshAssignedFlightsIfNeeds();
        }
      },

      async handleAddReserveClick(shift) {
        const { pilotId } = this;
        try {
          await this.bindShift({ shift, pilotId });
        } catch (e) {
          this.notifyError('Error creating assignment', e);
        } finally {
          await Promise.all([
            this.updateRecords({ pilots: [pilotId] }),
            this.refreshFDTCalendarIfNeeds(),
          ]);
        }
      },

      async handleDeletePairingClick(record) {
        const { pilotId } = this;
        const picId = get(record, 'pilot.id');
        const sicId = get(record, 'sic.id');

        try {
          if (record.pilot && record.sic) {
            const type = record.pilot.id === pilotId ? consts.PIC_RANK_ID : consts.SIC_RANK_ID;
            await this.deleteRecordPart({ record, type });
          } else {
            await this.deleteRecord(record.id);
          }
        } catch (e) {
          this.notifyError('Error deleting assignment', e);
        } finally {
          await Promise.all([
            this.refreshResults(),
            this.fetchLinked(this.filters),
            this.updateRecords({ pilots: [picId, sicId] }),
            this.refreshAssignedFlightsIfNeeds(),
            this.refreshFDTCalendarIfNeeds(),
          ]);
        }
      },

      async handleDeleteReserveClick(shift) {
        const { pilotId } = this;
        try {
          await this.deleteRecord(shift.id);
        } catch (e) {
          this.notifyError('Error deleting assignment', e);
        } finally {
          await Promise.all([
            this.updateRecords({ pilots: [pilotId] }),
            this.refreshFDTCalendarIfNeeds(),
          ]);
        }
      },

      async handleAddTravelClick() {
        const { pilot: { base } } = this.activePilot;
        try {
          const savedShift = await this.saveReserveShift({
            base: this.byIATA(base).id,
            pilot: this.pilotId,
          });
          await this.handleAddReserveClick(savedShift);
        } catch (e) {
          this.notifyError('Error adding travel shift', e);
        }
      },

      async handleUpdateTravelClick() {
        try {
          await this.saveReserveShift();
          await Promise.all([
            this.updateRecords({ pilots: [this.pilotId] }),
            this.refreshFDTCalendarIfNeeds(),
          ]);
        } catch (e) {
          this.notifyError('Error adding travel shift', e);
        }
      },

      async handleOFFClick({ type, comments }) {
        const { date, dateTime, pilotId } = this;
        if (this.isOffPromptEnabled) {
          const { pilot } = this.activePilot;
          const fullName = `${pilot.first_name} ${pilot.last_name}`;

          await MessageBox.confirm(
            `Setting day ${type.abbr} will clear all ${fullName}'s assignments for ${this.date}`,
            'Clear All Assignments',
            {
              confirmButtonText: `Set ${type.abbr}`,
              type: 'warning',
            },
          );
        }

        const assignedRecords = this.pilotRecordMap[pilotId].records[dateTime.day];
        const pics = map(assignedRecords, 'pilot');
        const sics = map(assignedRecords, 'sic');

        try {
          await this.bindDayOFF({
            type,
            date,
            pilotId,
            comments,
          });
        } catch (e) {
          this.notifyError('Error creating assignment', e);
        } finally {
          await Promise.all([
            this.updateRecords({ pilots: [pilotId, ...pics, ...sics] }),
            this.fetchLinked(this.filters),
            this.refreshAssignedFlightsIfNeeds(),
            this.refreshFDTCalendarIfNeeds(),
          ]);
        }
      },

      modalHeight() {
        const mainContainer = document.querySelector('.fltops-app');
        return mainContainer ? mainContainer.offsetHeight : false;
      },

      highlightRowClasses({ row: { score } }) {
        const maxScore = this.maxSuggestedScore;
        return {
          'pair-list__highlight': maxScore >= 1,
          'pair-list__highlight_suggest': (
            (maxScore > 1 && score > 1) ||
            (maxScore === 1 && score === 1)
          ),
        };
      },

      async focusSearchField() {
        await this.$nextTick();
        // TODO: add this functionality to Sortable table some time
        const el = this.$refs.content && this.$refs.content.querySelector('.sortable-table__search .el-input__inner');
        if (el) {
          el.focus();
        }
      },

      async handleKeyboard(e) {
        if (!this.canKeyboardBind) { return false; }

        switch (e.keyCode) {
          case 9: {
            e.preventDefault();
            if (e.getModifierState('Shift')) {
              this.handleShiftTabClick();
            } else {
              this.handleTabClick();
            }
            break;
          }
          case 78: {
            if (e.getModifierState('Shift')) {
              e.preventDefault();
              this.handleNkeyPress();
            }
            break;
          }
          case 79: {
            if (e.getModifierState('Shift')) {
              e.preventDefault();
              this.handleOkeyPress();
            }
            break;
          }
          case 13: {
            e.preventDefault();
            this.handleEnterClick();
            break;
          }
          default: break;
        }
        return undefined;
      },

      handleOkeyPress() {
        const type = find(this.dayOffTypes, ({ id }) => id === consts.OFF_OFF_TYPE_ID);
        this.handleOFFClick({ type });
      },

      handleNkeyPress() {
        const type = find(this.dayOffTypes, ({ id }) => id === consts.N_A_OFF_TYPE_ID);
        this.handleOFFClick({ type });
      },

      handleTabClick() {
        this.focusSearchField();
        const date = this.dateTime.plus({ days: 1 });

        if (this.dateTime.hasSame(date, 'month')) {
          this.showPairBinding({
            pilotId: this.pilotId,
            coordinates: {
              x: parseInt(this.coordinates.x) + 34,
              y: parseInt(this.coordinates.y),
            },
            date: date.toFormat(consts.LUXON_US_DATE_FORMAT),
          });
        }
      },
      async handleEnterClick() {
        this.focusSearchField();

        if (await this.submitTheOnlyPairing()) {
          this.refreshResults();
        }
      },

      handleShiftTabClick() {
        const date = this.dateTime.minus({ days: 1 });

        if (this.dateTime.hasSame(date, 'month')) {
          this.showPairBinding({
            pilotId: this.pilotId,
            coordinates: {
              x: parseInt(this.coordinates.x) - 34,
              y: parseInt(this.coordinates.y),
            },
            date: date.toFormat(consts.LUXON_US_DATE_FORMAT),
          });
        }
      },

      async handleTravelEditClick(shift) {
        this.activeTab = consts.TABS[6];
        await this.$nextTick();

        this[consts.SET_EDITABLE_RESERVE_SHIFT](shift);
      },

      async handleRemoveAllClick() {
        let pilots = [];
        try {
          pilots = await this.removeRecordsInSelectedRange();
        } catch (e) {
          this.notifyError('Error shifts removing', e);
        } finally {
          await Promise.all([
            this.updateRecords({ pilots }),
            this.fetchLinked(this.filters),
            this.refreshAssignedFlightsIfNeeds(),
            this.refreshFDTCalendarIfNeeds(),
            this.closePairBinding(),
          ]);
        }
      },
    },
    watch: {
      async isPairBindingVisible(value) {
        await this.$nextTick();
        if (value) this.focusSearchField();
      },
    },
  };
</script>

<template>
  <modal
    v-bind="coordinates"
    :show="isPairBindingVisible"
    :show-close="false"
    :transparent="true"
    :absolute="!isSmallScreen"
    :height="modalHeight()"
    @close="closePairBinding"
  >
    <div ref="content" :class="classes" v-if="isPairBindingVisible" @click="closePairBinding">
      <div v-if="date" class="pair-binding-modal__block-list pair-block-list" @click.stop.prevent>
        <block :block="block" class="pair-block-list__item" v-for="block in activeRecords" :key="block.id" />
      </div>

      <div class="pair-list" :style="pairListStyles" @click.stop>
        <off-section v-if="!isReadOnly"
                     class="pair-binding-modal__off-section"
                     :record-names="selectedShiftNames"
                     :off-types="dayOffTypes"
                     :day-off="dayOff"
                     @select="handleOFFClick" />
        <assigned-list
          :read-only="isReadOnly"
          @unassign-click="handleDeletePairingClick"
          @add-pairing-click="handleAddPairingClick"
          @travel-edit="handleTravelEditClick"
        />

        <el-tabs v-if="date && !isReadOnly" v-model="activeTab">
          <el-tab-pane :label="consts.TABS[0]" :name="consts.TABS[0]">
            <pairing-table
              v-if="activeTab === consts.TABS[0]"
              :filters="filters"
              :is-in-addition-mode="true"
              :is-dates-hidden="true"
              :row-class-name="highlightRowClasses"
              @add-pairing-click="handleAddPairingClick"
            />
          </el-tab-pane>

          <el-tab-pane :label="consts.TABS[1]" :name="consts.TABS[1]">
            <reserve-table
              v-if="activeTab === consts.TABS[1]"
              :type="consts.RESERVE_TYPE_ID"
              :filters="reserveFilters"
              :is-in-addition-mode="true"
              :selected-shift-names="selectedShiftNames"
              @add-reserve-click="handleAddReserveClick"
              @delete-reserve-click="handleDeleteReserveClick"
            />
          </el-tab-pane>
          <el-tab-pane :label="consts.TABS[2]" :name="consts.TABS[2]">
            <reserve-table
              v-if="activeTab === consts.TABS[2]"
              :type="consts.TRAINING_TYPE_ID"
              :filters="reserveFilters"
              :is-in-addition-mode="true"
              :selected-shift-names="selectedShiftNames"
              @add-reserve-click="handleAddReserveClick"
              @delete-reserve-click="handleDeleteReserveClick"
            />
          </el-tab-pane>
          <el-tab-pane :label="consts.TABS[3]" :name="consts.TABS[3]">
            <reserve-table
              v-if="activeTab === consts.TABS[3]"
              :type="consts.OFFICE_TYPE_ID"
              :filters="reserveFilters"
              :is-in-addition-mode="true"
              :selected-shift-names="selectedShiftNames"
              @add-reserve-click="handleAddReserveClick"
              @delete-reserve-click="handleDeleteReserveClick"
            />
          </el-tab-pane>
          <el-tab-pane :label="consts.TABS[6]" :name="consts.TABS[6]">
            <travel-form v-if="activeTab === consts.TABS[6]"
                         :date="dateTime"
                         @add-shift="handleAddTravelClick"
                         @update-shift="handleUpdateTravelClick"/>
          </el-tab-pane>
        </el-tabs>

        <el-button v-if="!date && !isReadOnly"
                   @click="handleRemoveAllClick"
                   class="pair-binding-modal__delete-all"
                   type="danger"
                   icon="el-icon-delete"
                   size="small">
          Remove all assigned shifts
        </el-button>
      </div>
    </div>
  </modal>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .pair-binding-modal {
    position: absolute;
    width: 560px;
    left: -261px;
    top: 0;
    display: flex;
    flex-flow: row wrap;
    justify-content: center;

    @media screen and (max-width: 460px) {
      width: 360px;
      left: -151px;
    }
    &._bulkDayOFFs {
      top: 10px;
    }

    &._top {
      bottom: -4px;
      top: auto;

      .pair-list {
        position: absolute;

        &:before {
          bottom: -5px;
          top: auto;
          border-top: 10px solid #f5f3f3;
          border-bottom: none;
        }
      }
    }

    &__block-list {
      width: 34px;
      border-radius: 3px;
      background: #fff;
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, .2);

      &:after {
        content: '';
        display: block;
        border: 2px dashed $navy;
        border-radius: 4px;
        height: 20px;
        margin: 2px;
      }
    }

    .pair-block-list {
      &__item {
        display: flex;
        margin: 2px 2px 0 2px;

        & + & {
          margin-top: 1px;
        }

        .calendar-block__record {
          flex: 0 0 29px;
          margin: 0;
        }
      }
    }


    .pair-list {
      position: relative;
      background: #fff;
      margin-top: 15px;
      flex: 1 1 100%;
      width: 100%;
      border-radius: 3px;
      box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.2);

      &:before {
        content: '';
        display: block;
        position: absolute;
        left: calc(50% - 10px);
        top: -10px;
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-bottom: 10px solid white;
      }

      &__highlight.el-table__row {
        background: transparentize($navy, 0.95);
      }
      &__highlight_suggest.el-table__row {
        background: white;
      }

      .el-tabs__nav {
        margin: 0 20px;
      }

      .el-tabs__content {
        border-bottom: 1px solid $--border-color-base;
      }
      .el-tabs__header {
        margin-bottom: 0;
      }
      .sortable-table {
        margin-top: 0;
        font-size: .95em;

        .sortable-table__search {
          background-color: #f5f3f3;
          border-bottom: solid 1px #e0ecec;
          padding: 10px;
          margin-bottom: 0;
          border-radius: 3px 3px 0 0;
          &__input {
            flex: 1 1;
            max-width: 100%;
          }
        }

        .el-table td {
          padding: 3px 0;


          &:first-child .cell {
            padding-left: 5px;
          }
          &:last-child .cell {
            padding-right: 5px;
          }
        }
      }
      .sortable-table__search {
        background: red
      }
    }

    .pairing-list.sortable-table .el-table td {
      padding: 0 !important;
    }

    &__delete-all {
      width: calc(100% - 10px);
      margin: 5px;
    }
  }
</style>

