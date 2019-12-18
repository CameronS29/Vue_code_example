import { each, filter, pickBy, mapKeys, mapValues, isEmpty, isEqual, isNull, isArray } from 'lodash';
import qs from 'query-string';

export const SET_FILTER = 'SET_FILTER';

export default (store, router, namespace, { queryPrefix = false }) => {

  const getNonPrefixedSearchParams = () => {
    const currentSearchParams = qs.parse(window.location.search);

    return pickBy(currentSearchParams, (value, key) => key.indexOf(queryPrefix) !== 0);
  };

  const syncSearch = () => {
    if (queryPrefix) {
      const nextSearchParams = pickBy(
        store.getters[`${namespace}/filterMap`],
        value => isArray(value)
          ? value && !isEmpty(value) && !isEqual(value, [null, null])
          : !isNull(value),
      );

      router.replace({
        query: {
          ...getNonPrefixedSearchParams(),
          ...mapKeys(nextSearchParams, (value, key) => `${queryPrefix}${key}`)
        }
      });
    }
  };

  return {
    namespaced: true,

    state: {
      filters: {},
    },

    getters: {
      filterModels(state) {
        const models = {};

        each(state.filters, (props, key) => {
          Object.defineProperty(models, key, {
            get() {
              return props.value;
            },
            set(value) {
              store.commit(`${namespace}/${SET_FILTER}`, { key, value });

              syncSearch();
            },
          });
        });

        return models;
      },
      filterMap(state) {
        return mapValues(state.filters, filter => filter.value);
      },
      hasFilters(state) {
        return !isEmpty(state.filters);
      },
    },

    actions: {},

    mutations: {
      [SET_FILTER](state, { key, value }) {
        state.filters = {
          ...state.filters,
          [key]: { ...state.filters[key], value },
        };
      },
      removeFilter(state, key) {
        state.filters = pickBy(state.filters, (_, k) => k !== key);

        syncSearch();
      },
      removeAllFilters(state) {
        state.filters = {};

        syncSearch();
      },
      addFilter(state, filter) {
        state.filters = {
          ...state.filters,
          [filter.key]: pickBy(filter, (_, k) => k !== 'key'),
        };
      },
    },
  };
};

