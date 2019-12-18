<script>
  import { mapState, mapActions, mapGetters } from 'vuex';
  import { filter, each } from 'lodash';

  import filterMixin from 'Common/Filters/mixin';
  import * as filterTypes from 'Common/Filters/types';
  import FilterEl from 'Common/Filters/Filter.vue';
  import ClearFiltersBtn from 'Common/Filters/ClearBtn.vue';
  import DateRangeField from 'Common/Form/Fields/DateRangeField.vue';
  import iataField from 'Common/Form/Fields/IATAField.vue';
  import TailNumberField from 'Common/Form/Fields/TailNumberField.vue';
  import OperatingUnderField from 'Common/Form/Fields/OperatingUnderField.vue';
  import OperationsField from 'Common/Form/Fields/OperationsField.vue';
  import FlightNumberField from 'Common/Form/Fields/FlightNumberField.vue';
  import PilotField from 'Common/Form/Fields/PilotField.vue';

  export const FILTER_MIXIN_PATH = 'dispatch/flight-list/filters';

  export default {
    props: {
      default: {
        type: Object,
        default: () => ({}),
      },
    },
    created() {
      each(this.default, (value, key) => {
        const filter = this.availableFilters.find(filter => filter.key === key);

        if (filter) this.addFilter({ ...filter, value });
      });
    },
    components: {
      FilterEl,
      ClearFiltersBtn,
      DateRangeField,
      iataField,
      TailNumberField,
      OperatingUnderField,
      OperationsField,
      FlightNumberField,
      PilotField,
    },
    mixins: [filterMixin(FILTER_MIXIN_PATH)],
    computed: {
      ...mapState('dispatch/flight-list', ['availableFilters']),
      filterList() {
        return filter(this.availableFilters, filter => !this.filters[filter.key]);
      },
    },
    data() {
      return {
        filterTypes,
      };
    },
    methods: {
      addFilterByKey(filterKey) {
        const filter = this.availableFilters.find(filter => filter.key === filterKey);

        if (filter) this.addFilter(filter);
      },
      handleAddFilter(filterKey) {
        this.addFilterByKey(filterKey);
      },
    },
  };
</script>

<template>
  <div class="flight-picker-filters">
    <div class="flight-picker-filters__search">
      <portal-target name="flight-picker-search" />
      <div
        v-if="filterList.length"
        class="flight-picker-filters__add-new">
        <el-select
          size="small"
          :value="null"
          @input="handleAddFilter"
          placeholder="Field Name">
          <el-option
            v-for="filter in filterList"
            :key="filter.key"
            :value="filter.key">
            {{ filter.label }}
          </el-option>
        </el-select>
        <span class="flight-picker-filters__add-new-desc">Select field to add new filter</span>
      </div>
      <clear-filters-btn
        class="flight-picker-filters__clear-all"
        v-if="hasFilters"
        @click="removeAllFilters" />
    </div>
    <div class="flight-picker-filters__list">
      <filter-el
        @delete="removeFilter(key)"
        :label="filter.label"
        :key="key"
        v-for="(filter, key) in filters">
        <pilot-field
          :control-props="{size: 'mini'}"
          type="PIC"
          v-if="filter.type === filterTypes.PIC"
          v-model="filterModels[key]" />
        <pilot-field
          :control-props="{size: 'mini'}"
          type="SIC"
          v-if="filter.type === filterTypes.SIC"
          v-model="filterModels[key]" />
        <iata-field
          :control-props="{size: 'mini'}"
          v-if="filter.type === filterTypes.IATAS"
          v-model="filterModels[key]" />
        <operations-field
          :control-props="{size: 'mini'}"
          v-if="filter.type === filterTypes.OPERATION_TYPES"
          v-model="filterModels[key]" />
        <operating-under-field
          :control-props="{size: 'mini'}"
          v-if="filter.type === filterTypes.OPERATING_UNDER"
          v-model="filterModels[key]" />
        <flight-number-field
          :control-props="{size: 'mini'}"
          v-if="filter.type === filterTypes.FLIGHT_NUMBER"
          v-model="filterModels[key]" />
        <tail-number-field
          :control-props="{size: 'mini'}"
          v-if="filter.type === filterTypes.AIRCRAFTS"
          v-model="filterModels[key]" />
        <el-input
          size="mini"
          v-if="filter.type === filterTypes.TEXT"
          v-model="filterModels[key]" />
        <el-date-picker
          v-if="filter.type === filterTypes.DATE"
          v-model="filterModels[key]"
          type="date"
          v-bind="{ size: 'mini' }"
        />
        <el-checkbox
          v-if="filter.type === filterTypes.FLAG"
          v-model="filterModels[key]" />
        <date-range-field
          v-if="filter.type === filterTypes.DATE_RANGE"
          :start-date-props="{ size: 'mini' }"
          :end-date-props="{ size: 'mini' }"
          v-model="filterModels[key]" />
        <date-range-field
          v-if="filter.type === filterTypes.DATE_TIME_RANGE"
          :start-date-props="{ size: 'mini', type: 'datetime' }"
          :end-date-props="{ size: 'mini', type: 'datetime' }"
          v-model="filterModels[key]" />
      </filter-el>
    </div>
  </div>
</template>


<style lang="scss">
  .flight-picker-filters {
    margin-bottom: 15px;
    &__list {
      display: flex;
      flex-flow: row wrap;
      &:not(:empty) {
        margin-top: 15px;
        margin-bottom: -10px;
      }
    }
    &__search {
      display: flex;
      align-items: flex-start;
      .vue-portal-target {
        margin-right: 20px;
        flex: 1 1 100%;
        .sortable-table__search {
          margin-bottom: 0;
          &__input {
            width: 100%;
            max-width: 100%;
          }
        }
      }
    }
    &__add-new {
      flex: 1 1;
      &-desc {
        white-space: nowrap;
        font-size: 12px;
        opacity: .6;
        padding: 0 2px;
      }
    }
    &__clear-all {
      height: 30px;
      margin-left: 20px;
      margin-top: 1px;
    }
  }
</style>

