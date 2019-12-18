import moment from 'moment';
import { ref, withParams } from 'vuelidate/lib/validators/common';
import {LUXON_DATE_FORMAT} from "components/MXC/Engine/Swap/Mixins/Fields";
import {DateTime} from 'luxon';

const getValue = value => moment(
  typeof value === 'function'
  ? value()
  : value
);

export const lessThan = date => withParams(
  { type: 'lessThan', date },
  value => moment(value).diff(getValue(date)) < 0,
);

export const greaterThan = date => withParams(
  { type: 'graterThan', date },
  value => moment(value).diff(getValue(date)) > 0,
);

export const lessThanField = fieldName => withParams(
  { type: 'lessThanField', fieldName },
  function (value, parentVm) {
    return moment(value).diff(
      moment(ref(fieldName, this, parentVm)),
    ) < 0;
  },
);

export const greaterThanField = fieldName => withParams(
  { type: 'greaterThanField', fieldName },
  function (value, parentVm) {
    return moment(value).diff(
      moment(ref(fieldName, this, parentVm)),
    ) > 0;
  },
);
export const greaterOrEqualThanField = fieldName => withParams(
  { type: 'greaterOrEqualThanField', fieldName },
  function (value, parentVm) {
    if (!value || !ref(fieldName, this, parentVm))
      return true;
    return (
      DateTime.fromString(value, LUXON_DATE_FORMAT, {'zone': 'utc'}) -
      DateTime.fromString(ref(fieldName, this, parentVm), LUXON_DATE_FORMAT, {'zone': 'utc'}) >= 0
    )
  },
);
export const lessOrEqualThanField = fieldName => withParams(
  { type: 'lessOrEqualThanField', fieldName },
  function (value, parentVm) {
    return (
      DateTime.fromString(value, LUXON_DATE_FORMAT, {'zone': 'utc'}) -
      DateTime.fromString(ref(fieldName, this, parentVm), LUXON_DATE_FORMAT, {'zone': 'utc'}) <= 0
    )
  },
);
