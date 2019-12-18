<script>
  import { mapState, mapActions, mapGetters } from 'vuex';
  import { each, filter, debounce, isEmpty, map } from 'lodash';

  import filterMixin from 'Common/Filters/mixin';
  import { getFilterMapFromQueryString } from 'Common/Filters/helpers';
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
  import UserField from 'Common/Form/Fields/UserField.vue';
  import Block from 'Common/Block.vue';
  import MelCategoryField from "Common/Form/Fields/MelCategoryField.vue";
  import SelectField from "Common/Form/Fields/SelectField.vue";

  export const FILTER_MIXIN_PATH = 'aircraft/discrepancy/filters';
  const DEFAULT_FILTER_KEYS = ['date_recorded', 'aircraft'];
  export const QUERY_PREFIX = 'filter-';
  const RESOLUTION_FILTER_OPTIONS = {
    2: 'Resolved',
    3: 'Unresolved',
  };

  export default {
    created() {
      const queryFilters = getFilterMapFromQueryString(QUERY_PREFIX);

      if (isEmpty(queryFilters)) {
        if (!this.filters.length) {
          DEFAULT_FILTER_KEYS.forEach(key => this.addFilterByKey(key));
        }
      } else {
        each(queryFilters, (value, key) => {
          const filter = this.availableFilters.find(filter => filter.key === key);

          if (filter) this.addFilter({ ...filter, value });
        });
      }
    },
    components: {
      MelCategoryField,
      Block,
      FilterEl,
      ClearFiltersBtn,
      DateRangeField,
      iataField,
      TailNumberField,
      OperatingUnderField,
      OperationsField,
      FlightNumberField,
      PilotField,
      UserField,
      SelectField,
    },
    mixins: [filterMixin(FILTER_MIXIN_PATH, { queryPrefix: QUERY_PREFIX })],
    computed: {
      ...mapState('aircraft/discrepancy', ['availableFilters']),
      filterList() {
        return filter(this.availableFilters, filter => !this.filters[filter.key]);
      },
      resolutionOptions() {
        return map(RESOLUTION_FILTER_OPTIONS, (label, value) => ({
          label,
          value,
        }));
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
  <block
    class="dispatch-flight-list-filters">
    <clear-filters-btn
      slot="title"
      v-if="hasFilters"
      @click="removeAllFilters" />

    <div class="dispatch-flight-list-filters__search">
      <portal-target name="discrepancy-list-search" />
      <div
        v-if="filterList.length"
        class="dispatch-flight-list-filters__add-new">
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
        <span class="dispatch-flight-list-filters__add-new-desc">Select field to add new filter</span>
      </div>
    </div>
    <div class="dispatch-flight-list-filters__list">
      <filter-el
        @delete="removeFilter(key)"
        :label="filter.label"
        :key="key"
        v-for="(filter, key) in filters">
        <pilot-field
          :control-props="{size: 'mini'}"
          field="user"
          type="PIC"
          v-if="filter.type === filterTypes.PIC"
          v-model="filterModels[key]" />
        <user-field
          :control-props="{size: 'mini'}"
          v-if="filter.type === filterTypes.USER"
          v-model="filterModels[key]" />
        <tail-number-field
          :control-props="{size: 'mini'}"
          v-if="filter.type === filterTypes.AIRCRAFTS"
          v-model="filterModels[key]" />
        <mel-category-field
          :control-props="{multiple: true}"
          v-if="filter.type === filterTypes.MEL_CATEGORY"
          v-model="filterModels[key]" />
        <select-field
          :attributes="{size: 'mini', clearable: true}"
          :options="resolutionOptions"
          v-if="filter.type === filterTypes.RESOLVED"
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
  </block>
</template>


<style lang="scss">
  .dispatch-flight-list-filters {
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
      @media screen and (max-width: 767px) {
        flex-flow: row wrap;
      }
      .vue-portal-target {
        margin-right: 20px;
        flex: 1 1 100%;
        @media screen and (max-width: 767px) {
          margin-right: 0;
          margin-bottom: 10px;
        }
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
      flex: 0 0 410px;
      @media screen and (max-width: 767px) {
        flex: 1 1 100%;
      }
      .el-select {
        margin-right: 10px;
        @media screen and (max-width: 767px) {
          width: 100%;
          margin-bottom: 5px;
        }
      }
      &-desc {
        white-space: nowrap;
      }
    }
  }
</style>

