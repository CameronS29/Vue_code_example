import { each, filter, isArray, isEmpty, mapKeys, mapValues, pickBy } from 'lodash';
import { DateTime } from 'luxon';

import { DATE, DATE_RANGE, DATE_TIME_RANGE, FLAG } from 'Common/Filters/types';
import qs from 'query-string';

export const typeBasedSerializer = (filters) => {
  const serializedFilters = {};

  each(filters, (filter, key) => {
    if (isArray(filter.value) && isEmpty(filter.value)) return;

    if ([DATE_RANGE, DATE_TIME_RANGE].indexOf(filter.type) > -1) {
      [0, 1].forEach((index) => {
        if (filter.value[index]) {
          const dateTime = DateTime
            .fromISO(filter.value[index])
            .setZone('UTC', { keepLocalTime: true });

          serializedFilters[`${key}_${index}`] = filter.type === DATE_RANGE
            ? dateTime.toISODate()
            : dateTime.toISO();
        }
      });
    } else if (filter.type === DATE) {
      serializedFilters[key] = DateTime
        .fromISO(filter.value)
        .setZone('UTC', { keepLocalTime: true })
        .toISODate();
    } else if (filter.type === FLAG) {
      serializedFilters[key] = filter.value ? 1 : 0;
    } else {
      serializedFilters[key] = filter.value;
    }
  });

  return serializedFilters;
};

export const getFilterMapFromQueryString = (queryPrefix) => {
  const currentSearchParams = qs.parse(window.location.search);
  const prefixedFilters = mapValues(
    pickBy(currentSearchParams, (value, key) => key.indexOf(queryPrefix) == 0),
    value => {
      if (isArray(value)) {
        return value;
      }

      if (value === 'true') return true;
      if (value === 'false') return false;

      return [value];
    },
  );

  return mapKeys(prefixedFilters, (value, key) => key.substr(queryPrefix.length));
};

