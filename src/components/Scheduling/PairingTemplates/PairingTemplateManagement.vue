<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { MessageBox } from 'element-ui';
  import { get, uniq, groupBy, flatten, map } from 'lodash';
  import format from 'date-fns/format';

  import SearchInput from 'Common/SearchInput.vue';
  import ButtonEl from 'Common/Button.vue';
  import Icon from 'Common/Icon.vue';
  import Block from 'Common/Block.vue';
  import Modal from 'Common/Modal.vue';

  import * as consts from 'store/modules/scheduling/consts';
  import { tableNamespace } from 'store/modules/scheduling/pairing-templates';
  import { isValidPairing, getFlightListByTemplate } from 'utils/flights';

  import PairingTable from './PairingTable.vue';
  import FlightTable from './FlightTable.vue';
  import FlightAdditionTable from './FlightAdditionTable.vue';
  import TableHeading from '../Common/TableHeading.vue';
  import OffManagement from './OffManagement.vue';
  import ReserveList from './reserve/List.vue';
  import Reserve from './reserve/Entity.vue';
  import ConfirmPatchModal from './ConfirmPatchModal.vue';
  import GroupEditForm from './GroupEditForm.vue';
  import dateRangeCheckMixin from '../Common/dateRangeCheckMixin';
  import HolidaysManagement from './HolidaysManagement.vue';

  const getDateString = jsDate => format(jsDate, consts.FNS_US_DATE_FORMAT);

  export default {
    mixins: [dateRangeCheckMixin],

    created() {
      this[consts.CHANGE_EDITABLE_PAIRING_TEMPLATE_GROUP](null);
      this.getAllAvailableAirports();
    },

    components: {
      PairingTable,
      FlightTable,
      FlightAdditionTable,
      TableHeading,
      OffManagement,
      ReserveList,
      Reserve,
      HolidaysManagement,

      ConfirmPatchModal,
      GroupEditForm,

      SearchInput,
      ButtonEl,
      Icon,
      Block,
      Modal,
    },


    data() {
      return {
        pairingAdditionStartDate: null,
        pairingAdditionEndDate: null,
        base: undefined,
        station: [],
        consts,
      };
    },

    computed: {
      ...mapState('scheduling/pairingTemplates', [
        'editablePairingTemplateGroupId',
        'editablePairingTemplateGroupTemplates',
        'editablePairingTemplateId',
        'activeTabIndex',
        'collisions',
      ]),

      ...mapGetters('scheduling/pairingTemplates', [
        'editablePairingTemplateGroup',
        'editablePairingTemplate',
        'flightNumberMap',
        'tomorrowFlightNumberMap',
        'filterByFlights',
        'sortedEditablePairingTemplateGroupTemplates',
        'isCollisionsExists',
        'activeGroupIntervals',
        'isLoading',
        'showGroupForm',
      ]),

      ...mapState('scheduling/pairingTemplates/reserve', [
        'editableReserveTemplate',
      ]),

      ...mapState(tableNamespace, {
        pairingTableResults: 'results',
      }),

      ...mapGetters('airports', ['airports', 'pilotBases']),

      editablePairingStartDate: {
        get() {
          return get(this.editablePairingTemplate, 'start_date', null);
        },
        set(value) {
          this.patchEditablePairingTemplate({ start_date: value });
        },
      },

      editablePairingEndDate: {
        get() {
          return get(this.editablePairingTemplate, 'end_date', null);
        },
        set(value) {
          this.patchEditablePairingTemplate({ end_date: value });
        },
      },

      editableBase: {
        get() { return get(this.editablePairingTemplate, 'base'); },
        set(base) { this.patchEditablePairingTemplate({ base }); },
      },

      editableStation: {
        get() { return get(this.editablePairingTemplate, 'station'); },
        set(station) { this.patchEditablePairingTemplate({ station }); },
      },

      activeTab: {
        get() {
          return consts.TABS[this.activeTabIndex];
        },
        set(value) {
          if (value === consts.TABS[this.activeTabIndex]) {
            return;
          }
          this[consts.SET_EDITABLE_RESERVE_TEMPLATE](null);
          this[consts.SET_ACTIVE_TAB_INDEX](consts.TABS.indexOf(value));
        },
      },

      showFirstColumn() {
        const fullWidthBreakPoint = window.matchMedia('(min-width: 992px)');
        if (fullWidthBreakPoint.matches) {
          return true;
        }

        return !this.showArrow;
      },

      showPairingBlock() {
        return this.editablePairingTemplateGroupId;
      },
      showArrow() {
        switch (this.activeTabIndex) {
          case 0:
            return this.showPairingBlock;
          case 1:
          case 2:
          case 3:
            return this.editableReserveTemplate;
          default:
            return false;
        }
      },

      collisionErrorMessages() {
        const groupedCollisions = groupBy(this.collisions, 'shells[0].name');
        return map(groupedCollisions, (collisions, name) => {
          const otherNames = map(collisions, 'shells[1].name');
          const collidedFlights = flatten(map(collisions, 'flights'));
          const flightNumbers = uniq(map(collidedFlights, 'flight.flight_number'));
          const flightPostfix = (flightNumbers.length > 1 ? 's' : '');

          return `A collision detected between ${name} and ${otherNames.join(', ')} templates.
        Please take a look at flight${flightPostfix} ${flightNumbers.join(', ')}.`;
        });
      },

      startPickerOptions() {
        const startDate = this.pairingAdditionStartDate;
        const endDate = this.pairingAdditionEndDate;
        const intervals = this.activeGroupIntervals;
        const disabledDate = this.pickerStartDateDisabled(startDate, endDate, intervals);
        return { disabledDate };
      },

      endPickerOptions() {
        const startDate = this.pairingAdditionStartDate;
        const endDate = this.pairingAdditionEndDate;
        const intervals = this.activeGroupIntervals;
        const disabledDate = this.pickerEndDateDisabled(startDate, endDate, intervals);
        return { disabledDate };
      },
    },

    methods: {
      ...mapActions('airports', ['getAllAvailableAirports']),
      ...mapMutations('scheduling/pairingTemplates', [
        consts.CHANGE_EDITABLE_PAIRING_TEMPLATE_GROUP,
        consts.CHANGE_EDITABLE_PAIRING_TEMPLATE,
        consts.SET_ACTIVE_TAB_INDEX,
        consts.ADD_FILTER_BY_FLIGHT_ID,
        consts.REMOVE_FILTER_BY_FLIGHT_ID,
        consts.ADD_FLIGHT_TO_PAIRING_TEMPLATE,
        consts.ADD_NEXT_DAY_FLIGHT_TO_PAIRING_TEMPLATE,
        consts.SHOW_AFFECT,
        consts.REMOVE_FLIGHT_FROM_PAIRING_TEMPLATE,
        consts.SET_EDITABLE_GROUP_FORM,
      ]),

      ...mapMutations('scheduling/pairingTemplates/reserve', [
        consts.SET_EDITABLE_RESERVE_TEMPLATE,
      ]),

      ...mapActions('scheduling/pairingTemplates', [
        'getPairingTemplates',
        'patchEditablePairingTemplateFlights',
        'patchEditablePairingTemplate',
        'addPairingTemplateGroup',
        'addPairingTemplate',
        'removePairingTemplate',
        'getCollisions',
        'getPairingTemplateAffect',
      ]),

      ...mapActions(tableNamespace, {
        refreshPairingTable: 'refreshResults',
      }),

      showFlightList(templateId) {
        return this.editablePairingTemplateGroupId
          && this.editablePairingTemplateId
          && templateId === this.editablePairingTemplateId;
      },

      handleEditPairingGroupClick(id) {
        this[consts.CHANGE_EDITABLE_PAIRING_TEMPLATE_GROUP](id);
        this.getPairingTemplates(id);
      },

      handleClosePairingClick() {
        this[consts.CHANGE_EDITABLE_PAIRING_TEMPLATE](null);
        this[consts.CHANGE_EDITABLE_PAIRING_TEMPLATE_GROUP](null);
      },

      handleClosePairingFlightsAdditionClick() {
        this[consts.CHANGE_EDITABLE_PAIRING_TEMPLATE](null);
      },

      patchTemplate(id) {
        this.getPairingTemplateAffect(id);
        this[consts.SHOW_AFFECT](id);
      },

      handleEditPairingTemplateClick(id) {
        this[consts.CHANGE_EDITABLE_PAIRING_TEMPLATE](id);
      },

      async handleAddPairingTemplateClick() {
        const startDate = this.pairingAdditionStartDate
          && getDateString(this.pairingAdditionStartDate);

        const endDate = this.pairingAdditionEndDate
          && getDateString(this.pairingAdditionEndDate);

        const { id } = await this.addPairingTemplate({ startDate, endDate });

        this.pairingAdditionStartDate = null;
        this.pairingAdditionEndDate = null;
        await this.getPairingTemplates(this.editablePairingTemplateGroupId);
        this.handleEditPairingTemplateClick(id);
      },

      async handlePairingTemplateRemove(id) {
        await MessageBox.confirm(
          'Are you sure you want to remove this template?',
          'Shift Template Removal',
        );
        await this.removePairingTemplate(id);
        await this.getPairingTemplates(this.editablePairingTemplateGroupId);
        this.refreshPairingTable();
      },

      async handleAddNewPairingGroup() {
        const { value } = await MessageBox.prompt(
          'Enter name for new Shift Template Group',
          'Shift Template Group Name',
          {
            inputPattern: /\w+/,
            inputErrorMessage: 'Name should be non-empty and contain only ' +
            'alphabetic and numeric characters.',
            confirmButtonText: 'Create',
            cancelButtonText: 'Cancel',
          },
        );
        await this.addPairingTemplateGroup(value);
        this.refreshPairingTable();
      },

      async handleRemoveFlight(flight) {
        await MessageBox.confirm(
          'Are you sure you want to remove this flight from template?',
          'Unlink flight',
        );
        this[consts.REMOVE_FLIGHT_FROM_PAIRING_TEMPLATE]({
          pairingTemplate: this.editablePairingTemplate,
          flight,
        });

        if (isValidPairing(getFlightListByTemplate(this.editablePairingTemplate))) {
          await this.patchEditablePairingTemplateFlights();
        }
      },

      async handleRemoveNextDayFlight(flight) {
        await MessageBox.confirm(
          'Are you sure you want to remove this flight from template?',
          'Unlink flight',
        );
        this[consts.REMOVE_FLIGHT_FROM_PAIRING_TEMPLATE]({
          pairingTemplate: this.editablePairingTemplate,
          flight: {
            ...flight,
            isNextDayFlight: true,
          },
        });

        if (isValidPairing(getFlightListByTemplate(this.editablePairingTemplate))) {
          await this.patchEditablePairingTemplateFlights();
        }
      },

      async handleAddFlight(flight) {
        this[consts.ADD_FLIGHT_TO_PAIRING_TEMPLATE]({
          pairingTemplate: this.editablePairingTemplate,
          flight,
        });

        if (isValidPairing(getFlightListByTemplate(this.editablePairingTemplate))) {
          await this.patchEditablePairingTemplateFlights();
        }
      },

      async handleAddNextDayFlight(flight) {
        this[consts.ADD_NEXT_DAY_FLIGHT_TO_PAIRING_TEMPLATE]({
          pairingTemplate: this.editablePairingTemplate,
          flight,
        });

        if (isValidPairing(getFlightListByTemplate(this.editablePairingTemplate))) {
          await this.patchEditablePairingTemplateFlights();
        }
      },

      handleRemoveFlightFromFilters(flight) {
        this[consts.REMOVE_FILTER_BY_FLIGHT_ID](flight.id);
      },

      handleAddFlightToFilters(flight) {
        this[consts.ADD_FILTER_BY_FLIGHT_ID](flight.id);
      },

      getFlightListByTemplate(shift) {
        return getFlightListByTemplate(shift);
      },

      handleShowGroupEditForm() {
        this[consts.SET_EDITABLE_GROUP_FORM](this.editablePairingTemplateGroup);
      },

      handleCloseGroupEditForm() {
        this[consts.SET_EDITABLE_GROUP_FORM]({});
      },

      handleSaveGroupEditForm() {
        this.handleCloseGroupEditForm();
        this.refreshPairingTable();
      },
    },
    watch: {
      pairingTableResults() {
        this.getCollisions();
      },
    },
  };
</script>

<template>
  <main class="pairing-templates">
    <confirm-patch-modal />

    <modal :show="showGroupForm" @close="handleCloseGroupEditForm" width="350">
      <group-edit-form v-if="showGroupForm"
                       @save="handleSaveGroupEditForm"
                       @cancel="handleCloseGroupEditForm" />
    </modal>

    <el-tabs
      type="border-card"
      v-model="activeTab"
      v-if="showFirstColumn"
      class="pairing-templates__block pairing-templates__block_groups"
    >
      <el-tab-pane :label="consts.TABS[0]" :name="consts.TABS[0]">
        <block>
          <el-alert
            title="Collision warning!"
            class="pairing-templates__collision-warning"
            type="warning"
            v-if="isCollisionsExists"
            :closable="false"
            show-icon>
            <div
              v-for="message in collisionErrorMessages"
              class="pairing-templates__collision-error-msg">{{ message }}
            </div>
          </el-alert>
          <div slot="title" class="pairing-templates__block-head">
            <button-el @click="handleAddNewPairingGroup" label="Add" size="sm"/>

            <div class="pairing-templates__filters-head">
              <el-select class="pairing-templates__filter-base"
                         v-model="base"
                         size="small"
                         placeholder="Base"
                         filterable
                         clearable>
                <el-option v-for="base in pilotBases" :key="base.id" :value="base.iata">
                  {{ base.iata }}
                </el-option>
              </el-select>

              <el-select class="pairing-templates__filter-station"
                         v-model="station"
                         size="small"
                         placeholder="Stations"
                         filterable
                         multiple>
                <el-option v-for="base in airports" :key="base.id" :value="base.iata">
                  {{ base.iata }}
                </el-option>
              </el-select>
              <portal-target name="pairing-table-search-input"/>
            </div>
          </div>

          <pairing-table
            search-portal="pairing-table-search-input"
            :filters="{ base, station }"
            :active-group-id="editablePairingTemplateGroupId"
            @edit-pairing-group-click="handleEditPairingGroupClick"
          />
        </block>
      </el-tab-pane>

      <el-tab-pane :label="consts.TABS[1]" :name="consts.TABS[1]">
        <reserve-list :type="consts.RESERVE_TYPE_ID"/>
      </el-tab-pane>
      <el-tab-pane :label="consts.TABS[2]" :name="consts.TABS[2]">
        <reserve-list :type="consts.TRAINING_TYPE_ID"/>
      </el-tab-pane>
      <el-tab-pane :label="consts.TABS[3]" :name="consts.TABS[3]">
        <reserve-list :type="consts.OFFICE_TYPE_ID"/>
      </el-tab-pane>
      <el-tab-pane :label="consts.TABS[4]" :name="consts.TABS[4]">
        <off-management/>
      </el-tab-pane>

      <el-tab-pane :label="consts.TABS[5]" :name="consts.TABS[5]">
        <holidays-management />
      </el-tab-pane>
    </el-tabs>

    <icon glyph="arrow-right" class="pairing-templates__arrow" v-if="showArrow"/>

    <block class="pairing-templates__block pairing-templates__block_templates"
           v-if="showPairingBlock && (activeTabIndex === 0)"
           v-loading="isLoading">
      <div slot="title" class="pairing-templates__block-head" v-if="editablePairingTemplateGroup">
        <span>
          {{ editablePairingTemplateGroup.name }}
          Templates
          <span v-if="editablePairingTemplateGroup.next_group">
            <icon glyph="link" /> to {{ editablePairingTemplateGroup.next_group_name }}
          </span>
        </span>
        <button-el outline icon="pencil" size="xs" title="Edit" @click="handleShowGroupEditForm"/>
        <el-button
          class="pairing-templates__block_templates-close-btn pairing-templates__block-close-btn"
          size="mini"
          round
          @click="handleClosePairingClick">Close
        </el-button>
      </div>

      <div class="flight-table__wrapper">
        <div
          class="flight-table"
          :key="template.id"
          v-for="template in sortedEditablePairingTemplateGroupTemplates"
        >

          <table-heading
            :editable="template.id === editablePairingTemplateId"
            :base="template.base"
            :station="template.station"
            :start-date="template.start_date"
            :end-date="template.end_date"
            :days-of-week="template.days_of_week"
            :disabled-intervals="activeGroupIntervals"
            @update:start-date="val => { editablePairingStartDate = val }"
            @update:end-date="val => { editablePairingEndDate = val }"
            @update:base="val => { editableBase = val }"
            @update:station="val => { editableStation = val }"
            @edit="handleEditPairingTemplateClick(template.id)"
            @delete="handlePairingTemplateRemove(template.id)"
          />

          <div v-if="template.upgrade_needed" class="upgrade-note" >
            <div class="upgrade-note__text">
              This template contains unapplied changes.
              Click
              <el-button type="primary" info size="mini" @click="patchTemplate(template.id)">
                Apply Changes
              </el-button>
              to submit them.
            </div>
          </div>
          <flight-table
            :data="getFlightListByTemplate(template)"
            :editable-mode="template.id === editablePairingTemplateId"
            :filter-by-flights="filterByFlights"
            @remove-flight="handleRemoveFlight"
            @remove-from-filters="handleRemoveFlightFromFilters"
            @add-to-filters="handleAddFlightToFilters"
          />

          <block
            class="pairing-templates__block pairing-templates__block_flights"
            v-if="showFlightList(template.id)">
            <div class="pairing-templates__block-head" slot="title">
              <span>Add Flight</span>
              <portal-target name="flights-search-input"/>
              <el-button class="pairing-templates__block-close-btn"
                         size="mini"
                         round
                         @click="handleClosePairingFlightsAdditionClick">
                Close
              </el-button>
            </div>

            <flight-addition-table
              :start-date="editablePairingTemplate.start_date"
              :end-date="editablePairingTemplate.end_date"
              :selected-flights="flightNumberMap"
              :selected-next-day-flights="tomorrowFlightNumberMap"
              :filter-by-flights="filterByFlights"
              @select-flight="handleAddFlight"
              @remove-flight="handleRemoveFlight"
              @select-next-day-flight="handleAddNextDayFlight"
              @remove-next-day-flight="handleRemoveNextDayFlight"
            />
          </block>
        </div>
      </div>

      <div class="pairing-templates__add-pairing">
        <el-date-picker
          v-model="pairingAdditionStartDate"
          placeholder="Pick Start Date"
          :picker-options="startPickerOptions"
        />
        <el-date-picker
          v-model="pairingAdditionEndDate"
          placeholder="Pick End Date"
          :picker-options="endPickerOptions"
        />
        <button-el label="Add New"
                   title="Create"
                   class="pairing-templates__add-pairing-btn"
                   @click="handleAddPairingTemplateClick" />
      </div>
    </block>

    <reserve class="pairing-templates__block"
             v-if="editableReserveTemplate && ([1,2,3].indexOf(activeTabIndex) !== -1)"/>
  </main>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .pairing-templates {
    $border-color: #e4e7ed;

    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    overflow-x: auto;
    padding-bottom: 20px;

    -ms-overflow-style: none;
    overflow: -moz-scrollbars-none;

    .el-tabs__content {
      padding: 0;
    }

    .el-table {
      &:first-child {
        .cell {
          @media screen and (min-width: $screen-sm-max) {
            padding-left: 18px;
          }
        }
      }
      &:last-child {
        .cell {
          @media screen and (min-width: $screen-sm-max) {
            padding-right: 18px;
          }
        }
      }
    }

    &::-webkit-scrollbar {
      display: none;
    }

    .block__title {
      height: 50px;
      padding: 0 18px;

      @media screen and (max-width: $screen-sm-max) {
        height: auto;
        padding: 5px 18px;
      }

      .sortable-table__search {
        margin-bottom: 0;
      }
    }

    .block__contents {
      padding: 0;
    }

    &__arrow {
      margin: 120px 15px 15px;
      text-align: center;
      font-size: 20px;

      @media screen and (max-width: $screen-md-max) {
        display: none;
      }
    }

    &__block {
      flex: 0 0 calc(50% - 28px);
      max-width: calc(50% - 28px);
      border: 1px solid rgba(204, 204, 204, 0.5);

      @media screen and (max-width: $screen-md-max) {
        flex: 0 0 calc(50% - 10px);
        max-width: calc(50% - 10px);
      }

      @media screen and (max-width: $screen-sm-max) {
        flex: 0 0 100%;
        max-width: 100%;
      }

      &_templates {
        border: none;
        background: $gray !important;

        .block__title {
          border-top: 1px solid $border-color;
          border-left: 1px solid $border-color;
          border-right: 1px solid $border-color;
        }
      }
    }

    &__block_flights {
      width: 98%;
      max-width: 98%;
      box-shadow: 0 0 30px rgba(0, 0, 0, .2);
      z-index: 99;
      position: relative;
      top: 10px;
      left: 1%;
    }

    &__block-close-btn {
      margin-left: 10px;
    }

    &__block_templates-close-btn {
      margin-left: auto;
    }

    .el-table &__active-row {
      background: transparentize($navy, 0.92);
    }

    &__block-head,
    &__add-pairing {
      display: flex;
      align-items: center;

      @media screen and (max-width: $screen-sm-max) {
        flex-flow: row wrap;
      }
      & > * {
        margin-right: 5px;
        &:last-child {
          margin-right: 0
        }
      }
    }

    &__block-head {
      flex: 1 1 100%;
      width: 100%;

      .vue-portal-target {
        flex: 1 1;
      }
    }

    &__filters-head {
      display: flex;
      font-weight: normal;
      margin-left: auto;

      & > * {
        margin-right: 5px;
      }
    }

    &__filter-base {
      width: 100px;
    }

    &__filter-station {
      width: 240px;
    }

    &__add-pairing {
      padding: 10px 18px 5px;
      background: #eef6f6;

      border: 1px solid $border-color;
      border-top: none;

      & > * { margin-bottom: 5px; }
    }

    &__add-pairing-btn {
      height: 38px;
    }

    &__collision-warning.el-alert {
      margin-bottom: 0;
    }
  }

  .upgrade-note {
    padding: 10px 15px;
    background: #fcf6ed;
    color: #e6a23c;
    display: flex;

    &__text {
      flex-grow: 1;
    }
  }

  .flight-table {
    border: 1px solid $border-color;
    border-bottom: none;
    margin-bottom: 10px;

    &:first-child { border-top: none; }
    &:last-child { margin-bottom: 0; }

    &__heading {
      background: #fff;
    }
  }
</style>
