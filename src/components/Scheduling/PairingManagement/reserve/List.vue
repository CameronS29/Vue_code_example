<script>
  import { mapState, mapGetters, mapActions, mapMutations } from 'vuex';
  import { MessageBox } from 'element-ui';
  import { DateTime } from 'luxon';

  import ButtonEl from 'Common/Button.vue';
  import Block from 'Common/Block.vue';

  import * as consts from 'store/modules/scheduling/consts';
  import { tableNamespaceByTypeId } from 'store/modules/scheduling/shifts/reserve';

  import RevisionButtons from '../RevisionButtons.vue';
  import ReserveTable from './ReserveTable.vue';

  export default {
    created() {
      this.getAllAvailableAirports();
    },
    components: {
      ButtonEl,
      RevisionButtons,
      ReserveTable,
      Block,
    },
    props: {
      monthlyPairingDate: Date,
      type: Number,
    },

    data() {
      return {
        pairingsDate: DateTime.local().toJSDate(),
        baseAirportIATAs: [],
      };
    },
    computed: {
      ...mapGetters('airports', ['pilotBases']),
      ...mapGetters('scheduling/revisions', ['activeRevision', 'activePublished']),
      ...mapState('scheduling/pairings/reserve', [
        'editableReserveShift',
      ]),
      filters() {
        const selectedDate = DateTime.fromJSDate(this.pairingsDate);

        return {
          shift_type: this.type,
          base: this.baseAirportIATAs,
          revision: this.activeRevision.id,
          date: selectedDate.toFormat(consts.LUXON_US_DATE_FORMAT),
        };
      },
      pairingsDatePickerOptions() {
        return {
          disabledDate: (value) => {
            const { year, month } = DateTime.fromJSDate(value);
            const { year: activeYear, month: activeMonth } =
              DateTime.fromJSDate(this.monthlyPairingDate);
            return !(year === activeYear && month === activeMonth);
          },
        };
      },
      isDateInMonthlyPairingDate() {
        const monthlyPairingDate = DateTime.fromJSDate(this.monthlyPairingDate);
        const pairingsDate = DateTime.fromJSDate(this.pairingsDate);

        return monthlyPairingDate.year === pairingsDate.year && monthlyPairingDate.month === pairingsDate.month;
      },
      tableNamespace() {
        return tableNamespaceByTypeId(this.type);
      },
    },
    methods: {
      ...mapActions('airports', ['getAllAvailableAirports']),
      ...mapActions('scheduling/pairings/reserve', ['deleteReserveShift']),

      async refreshTable() {
        return this.$store.dispatch(`${this.tableNamespace}/refreshResults`);
      },

      ...mapMutations('scheduling/pairings/reserve', [
        consts.SET_EDITABLE_RESERVE_SHIFT,
      ]),

      async handleAddNewReserve() {
        this[consts.SET_EDITABLE_RESERVE_SHIFT]({});
      },

      async handleEditReserveClick(shift) {
        this[consts.SET_EDITABLE_RESERVE_SHIFT](shift);
      },

      async handleDeleteReserveClick(shift) {
        await MessageBox.confirm(
          `Are you really want to remove ${shift.shortcut} shift?`,
          'Shift removing',
          {
            confirmButtonText: 'Yes',
            type: 'warning',
          },
        );

        await this.deleteReserveShift(shift.id);
        await this.refreshTable();
      },

      resetDateToMonthlyPairingDate() {
        this.pairingsDate = this.monthlyPairingDate;
      },
    },
    watch: {
      async monthlyPairingDate() {
        if (!this.isDateInMonthlyPairingDate)
          this.resetDateToMonthlyPairingDate();
      }
    }
  };
</script>

<template>
  <block class="reserve-shifts">
    <div class="reserve-shifts__block-head" slot="title">
      <button-el
        class="reserve-shifts__add-manual-shift-btn"
        label="Manual Shifting"
        icon="plus"
        size="m"
        v-if="!activePublished"
        @click="handleAddNewReserve"
      />

      <revision-buttons
        :tableNamespace="tableNamespace"
        :monthlyPairingDate="monthlyPairingDate"/>
    </div>

    <div class="reserve-shifts__pairing-filters">
      <el-select v-model="baseAirportIATAs" multiple filterable placeholder="Base">
        <el-option
          v-for="airport in pilotBases"
          :key="airport.id"
          :label="airport.iata"
          :value="airport.iata">
        </el-option>
      </el-select>

      <el-date-picker v-model="pairingsDate" :clearable="false" :picker-options="pairingsDatePickerOptions" />

      <portal-target class="reserve-shifts__search" :name="`reserve-shifts-${type}-search-input`" />
    </div>

    <reserve-table
      :searchPortal="`reserve-shifts-${type}-search-input`"
      :type="type"
      :filters="filters"
      @edit-reserve-click="handleEditReserveClick"
      @delete-reserve-click="handleDeleteReserveClick"
    />
  </block>
</template>

<style lang="scss">
  @import '../../../../../scss/bs-variables';

  .reserve-shifts {

    &__block-head,
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

    &__add-manual-shift-btn {
      margin-right: auto;
    }

    &__search {
      margin-left: auto;
    }

  }

</style>
