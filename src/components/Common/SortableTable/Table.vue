<script>
  import { isBoolean, isString, isArray, isEqual, debounce } from 'lodash';
  import { Table, Pagination } from 'element-ui';

  import ViewPortal from 'Common/ViewPortal.vue';
  import ButtonEl from 'Common/Button.vue';
  import SearchInput from 'Common/SearchInput.vue';

  import { queryParam } from '../../../utils/routers';

  const mql = window.matchMedia('(max-width: 767px)');

  export const prop = (propName, queryStringFallback) => ({
    get() {
      if (!this.affectQuerystring) {
        return this.local[propName];
      }

      return queryStringFallback.get.call(this);
    },
    set(value) {
      if (!this.affectQuerystring) {
        this.local = {
          ...this.local,
          [propName]: value,
        };
      } else {
        queryStringFallback.set.call(this, value);
      }
    }
  });


  export default {
    props: {
      /**
       * Store module namespace path to handle table actions.
       */
      namespace: {
        type: [String, Array],
        required: true,
      },

      /**
       * Filters object, of structure { [filter_name]: filter_value }
       */
      filters: {
        type: Object,
        default: () => ({}),
      },
      /**
       * @see http://element.eleme.io/#/en-US/component/table
       */
      rowClassName: {
        type: [String, Function],
        default: '',
      },
      tableSize: {
        type: String,
        default: 'medium',
      },
      /**
       * @see http://element.eleme.io/#/en-US/component/table
       */
      spanMethod: {
        type: [Function],
        default: null,
      },
      /**
       * Routing query prefix, needed for multiple tables on page.
       */
      queryPrefix: {
        type: String,
        default: '',
      },

      /**
       * Array of page sizes, shown in pagination
       */
      pageSizes: {
        type: Array,
        default: () => ([10, 20, 50, 100, 200]),
      },

      /**
       * Default page size
       */
      pageSize: {
        type: Number,
        default: 20,
      },

      /**
       * Makes data table searchable. Either {Boolean} or {String}
       * If its a {String}, will use that value as search query param.
       */
      searchable: {
        type: [Boolean, String],
        default: false,
      },
      /**
       * Useful for view like "list of 20 last manifests"
       */
      showPagination: {
        type: Boolean,
        default: true,
      },
      /**
       * If string specified, will render search input into portal with this name
       */
      searchPortal: {
        type: [Boolean, String],
        default: false,
      },
      /**
       * If string specified, will render CSV Download Button into portal with this name
       */
      csvPortal: {
        type: [Boolean, String],
        default: false,
      },
      /**
       * Bordered styling
       */
      isBordered: {
        type: Boolean,
        default: true,
      },
      /**
       * Client side results filter function.
       * Please be careful about disabling pagination etc.!
       */
      clientFilter: {
        type: [Function],
        default: row => row,
      },
      /**
       * Store module cleanup
       */
      resetOnDestroy: {
        type: Boolean,
        default: false,
      },
      /**
       * Default Sort in element format
       */
      defaultSort: {
        type: [Boolean, Object],
        default: false,
      },
      maxHeight: {
        type: [Number, undefined],
        default: undefined,
      },
      affectQuerystring: {
        type: Boolean,
        default: true,
      },
    },

    components: {
      TableEl: Table,
      Pagination,
      SearchInput,
      ViewPortal,
      ButtonEl,
    },

    created() {
      mql.addListener(this.handleResize);
      this.handleResize(mql);

      this.getResults();
      this.getResults = debounce(this.getResults, 200);
    },

    beforeDestroy() {
      this.size = this.pageSize;
      this.page = 1;
    },

    destroyed() {
      mql.removeListener(this.handleResize);

      if (this.resetOnDestroy) {
        return this.$store.dispatch(this.namespaced('resetResults'));
      }
      return undefined;
    },

    computed: {
      results() {
        return this.$store.getters[this.namespaced('results')].filter(this.clientFilter);
      },
      count() {
        return this.$store.getters[this.namespaced('count')];
      },
      pending() {
        return this.$store.getters[this.namespaced('pending')];
      },
      pagerLayout() {
        const isSlim = this.$store.getters[this.namespaced('slimPager')];
        return (isSlim
          ? 'total, sizes, prev, next'
          : 'total, sizes, prev, pager, next');
      },

      searchParam() {
        return !isString(this.searchable)
          ? 'search'
          : this.searchable;
      },

      params() {
        const { page, size, order: ordering } = this;
        const filters = { ...this.filters };
        if (this.searchable || this.searchable === '') {
          filters[this.searchParam] = this.search;
        }

        return {
          page,
          size,
          ordering,
          filters,
        };
      },

      size: prop('size', queryParam({
        param() {
          return this.prefixed('size');
        },
        defaultValue() {
          return this.pageSize;
        },
        mapper: Number,
      })),

      page: prop('page', queryParam({
        param() {
          return this.prefixed('page');
        },
        defaultValue: 1,
        mapper: Number,
      })),

      order: prop('order', queryParam({
        param() {
          return this.prefixed('order');
        },
      })),

      search: prop('search', queryParam({
        param() {
          return this.prefixed(this.searchParam);
        },
      })),

      hasPortal() {
        return this.searchPortal !== false;
      },

      isSearchable() {
        return !!this.searchable;
      },
    },

    data() {
      return {
        local: {},
      };
    },

    methods: {
      namespaced(param) {
        const ns = isArray(this.namespace)
          ? this.namespace.join('/')
          : this.namespace;
        return `${ns}/${param}`;
      },

      prefixed(param) {
        return `${this.queryPrefix}${param}`;
      },
      getResults() {
        return this.$store.dispatch(
          this.namespaced('getResults'),
          this.params,
        );
      },

      reSort({ column, prop, order }) {
        const sign = (order === 'ascending' ? '' : '-');
        const orderProp = (column === null || isBoolean(column.sortable)
          ? prop
          : column.sortable);

        this.order = (column !== null
          ? `${sign}${orderProp}`
          : undefined);
      },

      async getFilteredResults(newFilters, oldFilters) {
        if (!isEqual(newFilters, oldFilters)) {
          await this.$nextTick();

          this.page = 1;
          this.local = {};
          this.getResults();
        }
      },

      handleSearchChange() {
        this.page = 1;
        this.getResults();
      },

      handleResize({ matches }) {
        this.$store.dispatch(this.namespaced('setSlimPager'), matches);
      },

      handleCSVClick() {
        this.$store.dispatch(this.namespaced('getCSVURL'), this.params);
      },

      handleSelectionChange(values) {
        this.$emit('selection-change', values);
      },
    },

    watch: {
      namespace: 'getResults',
      page: 'getResults',
      size: 'getResults',
      order: 'getResults',
      search: 'handleSearchChange',
      filters: {
        handler: 'getFilteredResults',
        deep: true,
      },
    },
  };
</script>

<template>
  <div class="sortable-table" :class="{'sortable-table_portalled': hasPortal}">
    <portal :to="searchPortal || ''" :disabled="!hasPortal">
      <div class="sortable-table__search" v-if="isSearchable">
        <search-input v-model="search" class="sortable-table__search__input" />
      </div>
    </portal>

    <portal :to="csvPortal || ''" :disabled="!csvPortal">
      <button-el
        v-if="csvPortal"
        icon="list-alt"
        @click="handleCSVClick">
        Download as CSV
      </button-el>
    </portal>

    <div v-loading="pending">
      <table-el
        ref="table"
        v-bind="$attrs"
        :data="results"
        :max-height="maxHeight"
        style="width:100%;"
        @sort-change="reSort"
        :row-class-name="rowClassName"
        :border="isBordered"
        :size="tableSize"
        :default-sort="defaultSort ? defaultSort : undefined"
        @selection-change="handleSelectionChange"
      >
        <slot />
      </table-el>
    </div>

    <div class="sortable-table__pagination" v-if="showPagination">
      <pagination
        :current-page.sync="page"
        :page-sizes="pageSizes"
        :page-size="size"
        @size-change="newSize => { size = newSize }"

        :layout="pagerLayout"
        :total="count"
      />
    </div>
  </div>
</template>

<style lang="scss">
  @import '../../../../scss/bs-variables';

  .sortable-table {
    margin-bottom: 7px;
    position: relative;

    &_portalled {
      margin-top: 0;
    }

    &__pagination {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
    }

    &__spinner {
      opacity: 0.7;
    }

    &__search {
      margin-bottom: 12px;
      display: flex;
      justify-content: flex-end;

      &__input {
        min-width: 200px;
        max-width: 230px;
        width: 20%;

        @media screen and (max-width: $screen-xs-max) {
          min-width: unset;
          max-width: unset;
          width: 100%;
        }
      }
    }

    &::before, &::after {
      display: table;
      content: '';
      clear: both;
    }
  }
</style>
